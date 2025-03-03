import React, { useState, useEffect } from 'react';
import { getUtmPerformance, getOverallAnalytics, getGoogleAuthStatus, disconnectGoogleAnalytics } from '../api/analytics';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/useToast';
import CampaignLineChart from '../components/CampaignLineChart';

const Analytics = () => {
  const { toast } = useToast();
  const [utmParams, setUtmParams] = useState({
    medium: '',
    source: '',
    campaign: ''
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [utmPerformance, setUtmPerformance] = useState(null);
  const [overallAnalytics, setOverallAnalytics] = useState(null);
  const [dailyClicks, setDailyClicks] = useState<Record<string, Record<string, number>>>({});
  const [isUtmLoading, setIsUtmLoading] = useState(false);
  const [isOverallLoading, setIsOverallLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Function to check Google connection status
  const checkGoogleConnectionStatus = async () => {
    try {
      console.log('Checking Google Analytics connection status');
      const { connected } = await getGoogleAuthStatus();
      setIsGoogleConnected(connected);
      console.log('Successfully retrieved Google Analytics connection status');
    } catch (error) {
      console.error('Error checking Google connection status:', error);
    }
  };

  // Function to handle disconnecting from Google
  const handleDisconnectGoogle = async () => {
    try {
      await disconnectGoogleAnalytics();
      setIsGoogleConnected(false);
      toast({
        title: 'Success',
        description: 'Disconnected from Google Analytics',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to disconnect from Google Analytics',
      });
    }
  };

  // Check connection status on page load
  useEffect(() => {
    checkGoogleConnectionStatus();
  }, []);

  const handleUtmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!utmParams.medium && !utmParams.source && !utmParams.campaign) {
      toast({
        title: "Validation Error",
        description: "Please enter at least one UTM parameter (Medium, Source, or Campaign)",
        variant: "destructive"
      });
      return;
    }

    setIsUtmLoading(true);
    try {
      const data = await getUtmPerformance(utmParams);
      setUtmPerformance(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUtmLoading(false);
    }
  };

  const handleOverallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateRange.startDate || !dateRange.endDate) {
      toast({
        title: "Validation Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    setIsOverallLoading(true);
    try {
      const result = await getOverallAnalytics(dateRange.startDate, dateRange.endDate);
      setOverallAnalytics(result.data);
      setDailyClicks(result.data.dailyClicks);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsOverallLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Google Analytics connection status and disconnect button */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Google Analytics Connection</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${isGoogleConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isGoogleConnected ? 'Connected to Google Analytics' : 'Not connected to Google Analytics'}</span>
          </div>

          {isGoogleConnected && (
            <Button variant="destructive" onClick={handleDisconnectGoogle}>
              Disconnect from Google Analytics
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">UTM Performance</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUtmSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Medium"
                value={utmParams.medium}
                onChange={(e) => setUtmParams({...utmParams, medium: e.target.value})}
              />
              <Input
                placeholder="Source"
                value={utmParams.source}
                onChange={(e) => setUtmParams({...utmParams, source: e.target.value})}
              />
              <Input
                placeholder="Campaign"
                value={utmParams.campaign}
                onChange={(e) => setUtmParams({...utmParams, campaign: e.target.value})}
              />
            </div>
            <Button type="submit" disabled={isUtmLoading}>
              {isUtmLoading ? (
                <>
                  <span className="mr-2">Fetching...</span>
                  <span className="animate-spin">⟳</span>
                </>
              ) : (
                'Fetch UTM Performance'
              )}
            </Button>
          </form>

          {utmPerformance && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>Clicks: {utmPerformance.clicks}</div>
              <div>Conversions: {utmPerformance.conversions}</div>
              <div>Bounce Rate: {utmPerformance.bounceRate}%</div>
              <div>Avg Session Duration: {utmPerformance.avgSessionDuration}s</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Overall Analytics</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOverallSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
            <Button type="submit" disabled={isOverallLoading}>
              {isOverallLoading ? (
                <>
                  <span className="mr-2">Fetching...</span>
                  <span className="animate-spin">⟳</span>
                </>
              ) : (
                'Fetch Overall Analytics'
              )}
            </Button>
          </form>

          {overallAnalytics && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>Total Clicks: {overallAnalytics.totalClicks}</div>
                <div>Total Conversions: {overallAnalytics.totalConversions}</div>
                <div>Avg Bounce Rate: {overallAnalytics.avgBounceRate}%</div>
              </div>

              <h3 className="font-semibold mt-4">Top Performing Campaigns</h3>
              <div className="space-y-2">
                {overallAnalytics.topPerformingCampaigns.map((campaign, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4">
                    <div>{campaign.campaign}</div>
                    <div>Clicks: {campaign.clicks}</div>
                    <div>Conversions: {campaign.conversions}</div>
                  </div>
                ))}
              </div>

              {Object.keys(dailyClicks).length > 0 && (
                <div className="mt-6">
                  <CampaignLineChart
                    dailyClicks={dailyClicks}
                    campaigns={overallAnalytics.topPerformingCampaigns.map(c => c.campaign)}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;