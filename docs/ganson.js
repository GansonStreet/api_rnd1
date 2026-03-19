//  Drop ganson.js into your project root
//2. Add these 3 lines to your .env:

// ganson.js — Ganson Credential Connector
// Drop this file into any project and call getCredentials() to load your keys
// ----------------------------------------------------------
// SETUP: Add these to your .env file:
//   GANSON_URL=https://yourdomain.com
//   GANSON_PASS=your-admin-password
//   GANSON_CLIENT=your-client-slug   (e.g. "mariobistrobrews")
// ----------------------------------------------------------

require('dotenv').config();

const GANSON_URL    = process.env.GANSON_URL;
const GANSON_PASS   = process.env.GANSON_PASS;
const GANSON_CLIENT = process.env.GANSON_CLIENT;

// Build the auth token the same way your server does
const getToken = () =>
  Buffer.from(GANSON_PASS + ':gansonstreet').toString('base64');

// Fetch ALL credentials for a client
// Usage: const creds = await getCredentials();
const getCredentials = async (client = GANSON_CLIENT, env = null) => {
  const url = new URL(`${GANSON_URL}/api/credentials/${client}`);
  if (env) url.searchParams.set('env', env);

  const res = await fetch(url.toString(), {
    headers: { Authorization: 'Bearer ' + getToken() }
  });

  if (!res.ok) throw new Error(`Ganson error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.credentials; // flat key/value object
};

// Fetch credentials for a specific service only
// Usage: const twilio = await getServiceCredentials('twilio');
const getServiceCredentials = async (service, client = GANSON_CLIENT) => {
  const res = await fetch(
    `${GANSON_URL}/api/credentials/${client}/${service}`,
    { headers: { Authorization: 'Bearer ' + getToken() } }
  );

  if (!res.ok) throw new Error(`Ganson error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.credentials; // flat key/value object
};

module.exports = { getCredentials, getServiceCredentials };
