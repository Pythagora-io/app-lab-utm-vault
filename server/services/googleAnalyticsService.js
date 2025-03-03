const { analytics, oauth2Client } = require('../config/googleAnalytics');
const GoogleToken = require('../models/GoogleToken');
const GoogleAnalyticsProperty = require('../models/GoogleAnalyticsProperty');

class GoogleAnalyticsService {
  async refreshTokenIfNeeded(userId) {
    const googleToken = await GoogleToken.findOne({ userId });
    if (!googleToken) {
      throw new Error('Google Analytics not connected');
    }

    try {
      // Set the refresh token on the client
      oauth2Client.setCredentials({
        refresh_token: googleToken.refreshToken
      });

      const credentials = await oauth2Client.getAccessToken();
      oauth2Client.setCredentials({
        access_token: credentials.token,
        refresh_token: googleToken.refreshToken,
        expiry_date: credentials.res.data.expiry_date
      });

      return credentials.token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh Google Analytics token');
    }
  }

  isTokenExpired(credentials) {
    return !credentials.expiry_date || credentials.expiry_date <= Date.now();
  }

  async getUtmPerformance(utmParams, userId) {
    try {
      console.log('Starting getUtmPerformance with params:', { utmParams, userId });
      await this.refreshTokenIfNeeded(userId);

      // Get the user's GA4 property ID
      const propertyData = await GoogleAnalyticsProperty.findOne({ userId });
      if (!propertyData) {
        throw new Error('Google Analytics property ID not found');
      }

      console.log('Fetching UTM performance from Google Analytics:', utmParams);

      const response = await analytics.properties.runReport({
        property: `properties/${propertyData.propertyId}`,
        requestBody: {
          dateRanges: [
            {
              startDate: '7daysAgo',
              endDate: 'today'
            }
          ],
          dimensions: [
            {
              name: 'sessionMedium'
            },
            {
              name: 'sessionSource'
            },
            {
              name: 'sessionCampaignName'
            }
          ],
          metrics: [
            {
              name: 'screenPageViews'
            },
            {
              name: 'conversions'
            },
            {
              name: 'bounceRate'
            },
            {
              name: 'averageSessionDuration'
            }
          ],
          dimensionFilter: {
            andGroup: {
              expressions: [
                ...(utmParams.medium ? [{
                  filter: {
                    fieldName: 'sessionMedium',
                    stringFilter: {
                      matchType: 'EXACT',
                      value: utmParams.medium
                    }
                  }
                }] : []),
                ...(utmParams.source ? [{
                  filter: {
                    fieldName: 'sessionSource',
                    stringFilter: {
                      matchType: 'EXACT',
                      value: utmParams.source
                    }
                  }
                }] : []),
                ...(utmParams.campaign ? [{
                  filter: {
                    fieldName: 'sessionCampaignName',
                    stringFilter: {
                      matchType: 'EXACT',
                      value: utmParams.campaign
                    }
                  }
                }] : [])
              ]
            }
          }
        }
      });

      const [result] = response.data.rows || [{ metricValues: [{ value: '0' }, { value: '0' }, { value: '0' }, { value: '0' }] }];

      return {
        clicks: parseInt(result.metricValues[0].value),
        conversions: parseInt(result.metricValues[1].value),
        bounceRate: parseFloat((parseFloat(result.metricValues[2].value) * 100).toFixed(4)),
        avgSessionDuration: result.metricValues[3].value ? parseFloat(parseFloat(result.metricValues[3].value).toFixed(4)) : 0
      };

    } catch (error) {
      console.error('Error in getUtmPerformance:', {
        error: error.message,
        stack: error.stack,
        userId,
        utmParams
      });
      throw new Error('Failed to fetch UTM performance data');
    }
  }

  async getOverallAnalytics(dateRange, userId) {
    try {
      console.log('Starting getOverallAnalytics with params:', { dateRange, userId });
      await this.refreshTokenIfNeeded(userId);

      // Get the user's GA4 property ID
      const propertyData = await GoogleAnalyticsProperty.findOne({ userId });
      if (!propertyData) {
        throw new Error('Google Analytics property ID not found');
      }

      console.log('Fetching overall analytics:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await analytics.properties.runReport({
        property: `properties/${propertyData.propertyId}`,
        requestBody: {
          dateRanges: [{
            startDate: dateRange.startDate.toISOString().split('T')[0],
            endDate: dateRange.endDate.toISOString().split('T')[0]
          }],
          dimensions: [{
            name: 'sessionCampaignName'
          }],
          metrics: [{
            name: 'sessions'
          }, {
            name: 'conversions'
          }, {
            name: 'bounceRate'
          }],
          orderBys: [{
            desc: true,
            metric: {
              metricName: 'sessions'
            }
          }]
        }
      });

      console.log('Campaign response data:', {
        rows: response.data.rows,
        dimensionHeaders: response.data.dimensionHeaders,
        metricHeaders: response.data.metricHeaders,
        rowCount: response.data.rowCount
      });

      console.log('Raw campaign data rows:', response.data.rows.map(row => ({
        campaign: row.dimensionValues[0].value,
        metrics: row.metricValues.map(mv => mv.value)
      })));

      const totalResponse = await analytics.properties.runReport({
        property: `properties/${propertyData.propertyId}`,
        requestBody: {
          dateRanges: [{
            startDate: dateRange.startDate.toISOString().split('T')[0],
            endDate: dateRange.endDate.toISOString().split('T')[0]
          }],
          metrics: [{
            name: 'sessions'
          }, {
            name: 'conversions'
          }, {
            name: 'bounceRate'
          }]
        }
      });

      console.log('Total response data:', {
        rows: totalResponse.data.rows,
        dimensionHeaders: totalResponse.data.dimensionHeaders,
        metricHeaders: totalResponse.data.metricHeaders,
        rowCount: totalResponse.data.rowCount
      });

      console.log('Processing response data:', {
        hasRows: !!response.data.rows,
        rowCount: response.data.rows?.length,
        hasTotalRows: !!totalResponse.data.rows,
        totalRowCount: totalResponse.data.rows?.length
      });

      const rows = response.data.rows || [];
      const [totalResult] = totalResponse.data.rows || [{ metricValues: [{ value: '0' }, { value: '0' }, { value: '0' }] }];

      const systemCampaigns = ['(not set)', '(organic)', '(direct)', '(referral)'];
      const processedCampaigns = rows
        .filter(row => !systemCampaigns.includes(row.dimensionValues[0].value))
        .map(row => ({
          campaign: row.dimensionValues[0].value,
          clicks: parseInt(row.metricValues[0].value),
          conversions: parseInt(row.metricValues[1].value)
        }));

      console.log('Processed campaign data:', processedCampaigns);

      return {
        totalClicks: parseInt(totalResult.metricValues[0].value),
        totalConversions: parseInt(totalResult.metricValues[1].value),
        avgBounceRate: parseFloat((parseFloat(totalResult.metricValues[2].value) * 100).toFixed(4)),
        topPerformingCampaigns: processedCampaigns
      };

    } catch (error) {
      console.error('Error in getOverallAnalytics:', {
        error: error.message,
        stack: error.stack,
        userId,
        dateRange
      });
      throw new Error('Failed to fetch overall analytics data: ' + error.message);
    }
  }

  async getDailyCampaignClicks(dateRange, userId) {
    try {
      console.log('Starting getDailyCampaignClicks with params:', { dateRange, userId });
      await this.refreshTokenIfNeeded(userId);

      const propertyData = await GoogleAnalyticsProperty.findOne({ userId });
      if (!propertyData) {
        throw new Error('Google Analytics property ID not found');
      }

      console.log('Fetching daily campaign clicks:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await analytics.properties.runReport({
        property: `properties/${propertyData.propertyId}`,
        requestBody: {
          dateRanges: [{
            startDate: dateRange.startDate.toISOString().split('T')[0],
            endDate: dateRange.endDate.toISOString().split('T')[0]
          }],
          dimensions: [
            { name: 'date' },
            { name: 'sessionCampaignName' }
          ],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }]
        }
      });

      const dailyClicks = {};
      const systemCampaigns = ['(not set)', '(organic)', '(direct)', '(referral)'];

      response.data.rows.forEach(row => {
        const date = row.dimensionValues[0].value;
        const campaign = row.dimensionValues[1].value;
        const clicks = parseInt(row.metricValues[0].value);

        if (!systemCampaigns.includes(campaign)) {
          if (!dailyClicks[date]) {
            dailyClicks[date] = {};
          }
          dailyClicks[date][campaign] = clicks;
        }
      });

      return dailyClicks;
    } catch (error) {
      console.error('Error in getDailyCampaignClicks:', {
        error: error.message,
        stack: error.stack,
        userId,
        dateRange
      });
      throw new Error('Failed to fetch daily campaign clicks data: ' + error.message);
    }
  }
}

module.exports = new GoogleAnalyticsService();