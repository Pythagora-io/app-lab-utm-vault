import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleGoogleAuthCallback } from '@/api/analytics';
import { useToast } from '@/hooks/useToast';

export function GoogleCallback() {
  const [status, setStatus] = useState('Processing...');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get code and state from URL search params
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');

        console.log('Received callback with code and state:', { code: !!code, state });

        if (!code) {
          setStatus('Error: No authorization code received');
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "No authorization code received from Google"
          });

          // Check if this is a popup window
          if (window.opener && window.opener !== window) {
            // Send error message to parent window
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: encodeURIComponent("No authorization code received from Google")
            }, window.location.origin);
            // Close popup after a short delay
            setTimeout(() => window.close(), 1000);
            return;
          }

          setTimeout(() => navigate('/settings'), 3000);
          return;
        }

        // Process the code and state
        const response = await handleGoogleAuthCallback(code, state);

        setStatus('Authentication successful! Redirecting...');

        // Check if this is a popup window
        if (window.opener && window.opener !== window) {
          // Send success message to parent window
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS'
          }, window.location.origin);
          // Close popup after a short delay
          setTimeout(() => window.close(), 1000);
          return;
        }

        toast({
          title: "Success",
          description: "Successfully connected to Google Analytics"
        });
        setTimeout(() => navigate('/settings'), 1000);
      } catch (error) {
        console.error('Error processing callback:', error);
        setStatus(`Error: ${error.message}`);

        // Check if this is a popup window
        if (window.opener && window.opener !== window) {
          // Send error message to parent window
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: encodeURIComponent(error.message)
          }, window.location.origin);
          // Close popup after a short delay
          setTimeout(() => window.close(), 1000);
          return;
        }

        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message
        });
        setTimeout(() => navigate('/settings'), 3000);
      }
    };

    processCallback();
  }, [location, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Google Authentication</h1>
        <p>{status}</p>
      </div>
    </div>
  );
}