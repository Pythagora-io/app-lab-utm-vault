const express = require('express');
const router = express.Router();
const { oauth2Client, getOAuth2Client } = require('../config/googleAnalytics');
const GoogleToken = require('../models/GoogleToken');
const { requireUser } = require('./middleware/auth');

// Store user IDs temporarily for OAuth flow
const pendingAuthUsers = new Map();

router.get('/auth/google', requireUser, (req, res) => {
  console.log('Initiating Google OAuth flow for user:', req.user.id);
  try {
    // Get redirect_uri from query params if provided
    const redirectUri = req.query.redirect_uri || null;
    console.log('Requested redirect URI:', redirectUri);

    // Create a unique state parameter to identify this auth request
    const state = Math.random().toString(36).substring(2, 15);

    // Store user ID with state parameter (expires in 10 minutes)
    pendingAuthUsers.set(state, {
      userId: req.user.id,
      timestamp: Date.now(),
      redirectUri
    });

    // Clean up old entries
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, value] of pendingAuthUsers.entries()) {
      if (value.timestamp < tenMinutesAgo) {
        pendingAuthUsers.delete(key);
      }
    }

    console.log('Stored user ID with state:', state);

    // Use the oauth client with the correct redirect URI
    const oauthClient = redirectUri ? getOAuth2Client(redirectUri) : oauth2Client;

    // Generate auth URL with state parameter
    const url = oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/analytics.readonly'],
      prompt: 'consent',
      state: state
    });

    console.log('Generated auth URL:', url);
    res.json({ url });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

router.get('/auth/google/callback', async (req, res) => {
  const { code, state, redirect_uri } = req.query;
  console.log('Received Google OAuth callback with code');
  console.log('State from callback:', state);
  console.log('Redirect URI from request:', redirect_uri);

  try {
    // Get userId from pending auth map using state
    let userId = null;
    let customRedirectUri = null;

    if (state && pendingAuthUsers.has(state)) {
      const authData = pendingAuthUsers.get(state);
      userId = authData.userId;
      customRedirectUri = authData.redirectUri;
      pendingAuthUsers.delete(state); // Clean up
      console.log('Retrieved user ID from state:', userId);
    } else if (req.session && req.session.oauthUserId) {
      // Fallback to session if available
      userId = req.session.oauthUserId;
      console.log('Retrieved user ID from session:', userId);
      delete req.session.oauthUserId;
    } else if (state) {
      // If state is provided but not found, it might have been consumed already
      console.log('State provided but not found in pendingAuthUsers map. It might have been consumed already.');

      // Check if we have a Google token for any user
      const tokens = await GoogleToken.find();
      if (tokens.length > 0) {
        // If we have tokens, the authentication was likely successful in another window
        return res.json({
          success: true,
          message: 'Authentication already processed in another window'
        });
      }
    }

    if (!userId) {
      throw new Error('Authentication session expired');
    }

    // Use the correct redirect URI
    const finalRedirectUri = redirect_uri || customRedirectUri;
    console.log('Using redirect URI:', finalRedirectUri);

    // Get an OAuth client with the appropriate redirect URI
    const oauthClient = finalRedirectUri ? getOAuth2Client(finalRedirectUri) : oauth2Client;

    const { tokens } = await oauthClient.getToken(code);
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

    // Store access token in session if available
    if (req.session) {
      console.log('Storing access token in session');
      req.session.googleAccessToken = tokens.access_token;
      req.session.googleTokenExpiry = tokens.expiry_date;

      // Save the session explicitly
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Set credentials for current request
    oauthClient.setCredentials(tokens);
    console.log('Set credentials in oauth2Client');

    // Return JSON response
    res.json({ success: true });
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
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