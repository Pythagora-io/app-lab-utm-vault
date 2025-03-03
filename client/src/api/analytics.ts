import api from './api';

// Description: Get UTM parameter performance data
// Endpoint: GET /api/analytics/utm-performance
// Request: { medium?: string, source?: string, campaign?: string }
// Response: { success: boolean, data: { clicks: number, conversions: number, bounceRate: number, avgSessionDuration: number } }
export const getUtmPerformance = async (params: {
  medium?: string;
  source?: string;
  campaign?: string;
}) => {
  console.log('Making request to getUtmPerformance with params:', params);
  try {
    const response = await api.get('/api/analytics/utm-performance', { params });
    console.log('Received response from getUtmPerformance:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getUtmPerformance API call:', error);
    throw error;
  }
};

// Description: Get overall analytics data
// Endpoint: GET /api/analytics/overall
// Request: { startDate?: string, endDate?: string }
// Response: {
//   success: boolean,
//   data: {
//     totalClicks: number,
//     totalConversions: number,
//     avgBounceRate: number,
//     topPerformingCampaigns: Array<{
//       campaign: string,
//       clicks: number,
//       conversions: number
//     }>,
//     dailyClicks: Record<string, Record<string, number>>
//   }
// }
export const getOverallAnalytics = async (startDate?: string, endDate?: string) => {
  try {
    const response = await api.get('/api/analytics/overall', { params: { startDate, endDate } });
    return response.data;
  } catch (error) {
    console.error('Error fetching overall analytics:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

export const getGoogleAuthStatus = async () => {
  try {
    console.log('Checking Google Analytics connection status');
    const response = await api.get('/api/auth/google/status');
    console.log('Successfully retrieved Google Analytics connection status');
    return response.data;
  } catch (error) {
    console.error('Error checking Google Analytics connection:', error);
    console.error('Error stack:', error.stack);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

export const saveGAProperty = async (propertyId: string) => {
  try {
    console.log('Saving Google Analytics property ID:', propertyId);
    const response = await api.post('/api/google/property', { propertyId });
    console.log('Successfully saved Google Analytics property ID');
    return response.data;
  } catch (error) {
    console.error('Error saving Google Analytics property ID:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

export const getGAProperty = async () => {
  try {
    console.log('Fetching Google Analytics property ID');
    const response = await api.get('/api/google/property');
    console.log('Successfully retrieved Google Analytics property ID');
    return response.data;
  } catch (error) {
    console.error('Error fetching Google Analytics property ID:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

export const disconnectGoogleAnalytics = async () => {
  try {
    console.log('Disconnecting from Google Analytics');
    const response = await api.post('/api/auth/google/disconnect');
    console.log('Successfully disconnected from Google Analytics');
    return response.data;
  } catch (error) {
    console.error('Error disconnecting from Google Analytics:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};