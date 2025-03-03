const express = require('express');
const router = express.Router();
const { oauth2Client } = require('../config/googleAnalytics');
const GoogleToken = require('../models/GoogleToken');
const { requireUser } = require('./middleware/auth');

router.get('/auth/google', requireUser, (req, res) => {
  console.log('Initiating Google OAuth flow for user:', req.user.id);
  try {
    // Store userId in session before redirect
    req.session.oauthUserId = req.user.id;

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/analytics.readonly'],
      prompt: 'consent'
    });
    res.json({ url });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Update the callback handler to work with proxied requests
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  console.log('Received Google OAuth callback with code');

  try {
    // Get userId from session
    const userId = req.session.oauthUserId;
    if (!userId) {
      throw new Error('Authentication session expired');
    }
    console.log('Retrieved user ID from session:', userId);

    const { tokens } = await oauth2Client.getToken(code);
    console.log('New OAuth2 tokens received');

    if (tokens.refresh_token) {
      console.log('Storing refresh token for user:', userId);
      await GoogleToken.findOneAndUpdate(
        { userId },
        {
          userId,
          refreshToken: tokens.refresh_token
        },
        { upsert: true, new: true }
      );
    }

    // Clean up the session variable
    delete req.session.oauthUserId;

    // Store access token in session
    if (req.session) {
      console.log('Storing access token in session');
      req.session.googleAccessToken = tokens.access_token;
      req.session.googleTokenExpiry = tokens.expiry_date;
    }

    // Set credentials for current request
    oauth2Client.setCredentials(tokens);
    console.log('Set credentials in oauth2Client');

    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    res.status(500).send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: '${encodeURIComponent(error.message)}'
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  }
});

router.get('/auth/google/status', requireUser, async (req, res) => {
  try {
    console.log('Checking Google OAuth status for user:', req.user.id);

    // Check if we have a refresh token in the database
    const googleToken = await GoogleToken.findOne({ userId: req.user.id });
    console.log('Found Google token in database:', !!googleToken);

    let connected = false;

    // If we have a refresh token but no access token in session, refresh it
    if (googleToken && !req.session?.googleAccessToken) {
      console.log('No access token in session, refreshing using stored refresh token');
      try {
        const { tokens } = await oauth2Client.refreshToken(googleToken.refreshToken);

        // Store new access token and expiry in session
        req.session.googleAccessToken = tokens.access_token;
        req.session.googleTokenExpiry = tokens.expiry_date;

        console.log('Successfully refreshed access token and stored in session');
        connected = true;
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        connected = false;
      }
    } else if (googleToken && req.session?.googleAccessToken) {
      // We have both refresh token and access token
      connected = true;
    }

    res.json({
      connected,
      expiryDate: req.session?.googleTokenExpiry || null
    });
  } catch (error) {
    console.error('Error checking Google OAuth status:', error);
    res.status(500).json({
      error: error.message || 'Failed to check Google OAuth status'
    });
  }
});

router.post('/auth/google/disconnect', requireUser, async (req, res) => {
  try {
    console.log('Disconnecting Google OAuth for user:', req.user.id);

    // Find the Google token for this user
    const googleToken = await GoogleToken.findOne({ userId: req.user.id });

    if (googleToken) {
      console.log('Found Google token to disconnect');

      // Try to revoke the token using Google's revoke endpoint
      try {
        // If we have a refresh token, revoke it
        if (googleToken.refreshToken) {
          await oauth2Client.revokeToken(googleToken.refreshToken);
          console.log('Successfully revoked Google OAuth refresh token');
        }
      } catch (revokeError) {
        // Log but continue - we still want to remove from our DB even if revoke fails
        console.error('Error revoking Google token:', revokeError);
      }

      // Delete the token from our database
      await GoogleToken.deleteOne({ userId: req.user.id });
      console.log('Deleted Google token from database');
    }

    // Clear the access token from the session
    if (req.session) {
      delete req.session.googleAccessToken;
      delete req.session.googleTokenExpiry;
      console.log('Cleared Google tokens from session');
    }

    res.json({ success: true, message: 'Successfully disconnected from Google Analytics' });
  } catch (error) {
    console.error('Error disconnecting from Google Analytics:', error);
    res.status(500).json({
      error: error.message || 'Failed to disconnect from Google Analytics'
    });
  }
});

module.exports = router;