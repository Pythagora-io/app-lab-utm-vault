const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

// Update the redirect URI to go through frontend first
const redirectUri = process.env.NODE_ENV === 'production'
  ? process.env.GOOGLE_REDIRECT_URI
  : 'http://localhost:5173/api/google/callback';

const oauth2Client = new OAuth2Client(
  // INPUT_REQUIRED {Add your Google OAuth client ID from Google Cloud Console}
  process.env.GOOGLE_CLIENT_ID,
  // INPUT_REQUIRED {Add your Google OAuth client secret from Google Cloud Console}
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

const analytics = google.analyticsdata({
  version: 'v1beta',
  auth: oauth2Client
});

// Add logging for OAuth2 client creation
console.log('Initializing Google Analytics OAuth2 client with redirect URI:', redirectUri);

oauth2Client.on('tokens', (tokens) => {
  console.log('New OAuth2 tokens received:', tokens);
  if (tokens.refresh_token) {
    console.log('Received refresh token');
  }
});

oauth2Client.on('error', (error) => {
  console.error('OAuth2 client error:', error);
});

module.exports = { oauth2Client, analytics };