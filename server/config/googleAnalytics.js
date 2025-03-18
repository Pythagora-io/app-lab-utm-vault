const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

// Use a function to get the redirect URI dynamically
const getRedirectUri = (customRedirectUri) => {
  if (customRedirectUri) {
    console.log(`Using custom redirect URI: ${customRedirectUri}`);
    return customRedirectUri;
  }

  const defaultRedirectUri = process.env.NODE_ENV === 'production'
    ? process.env.GOOGLE_REDIRECT_URI
    : 'http://localhost:5173/auth/google/callback';

  console.log(`Using default redirect URI: ${defaultRedirectUri}`);
  return defaultRedirectUri;
};

// Create a function to get an OAuth client with the appropriate redirect URI
const getOAuth2Client = (customRedirectUri) => {
  const redirectUri = getRedirectUri(customRedirectUri);
  console.log('Creating OAuth2 client with redirect URI:', redirectUri);

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  // Ensure the redirect URI is set
  if (!client._redirectUri) {
    console.log('Setting _redirectUri property explicitly');
    client._redirectUri = redirectUri;
  }

  client.on('tokens', (tokens) => {
    console.log('New OAuth2 tokens received:', tokens);
    if (tokens.refresh_token) {
      console.log('Received refresh token');
    }
  });

  client.on('error', (error) => {
    console.error('OAuth2 client error:', error);
  });

  return client;
};

// Create the default OAuth2 client
const oauth2Client = getOAuth2Client();

const analytics = google.analyticsdata({
  version: 'v1beta',
  auth: oauth2Client
});

console.log('Initializing Google Analytics OAuth2 client with default redirect URI:', getRedirectUri());

module.exports = { oauth2Client, analytics, getOAuth2Client };