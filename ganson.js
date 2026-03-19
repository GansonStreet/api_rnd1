require('dotenv').config();

const GANSON_URL  = process.env.GANSON_URL;
const GANSON_PASS = process.env.GANSON_PASS;

const getToken = () =>
  Buffer.from(GANSON_PASS + ':gansonstreet').toString('base64');

const getCredentials = async (client, env = null) => {
  const url = new URL(`${GANSON_URL}/api/credentials/${client}`);
  if (env) url.searchParams.set('env', env);
  const res = await fetch(url.toString(), {
    headers: { Authorization: 'Bearer ' + getToken() }
  });
  if (!res.ok) throw new Error(`Ganson error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.credentials;
};

const getServiceCredentials = async (service, client) => {
  const res = await fetch(
    `${GANSON_URL}/api/credentials/${client}/${service}`,
    { headers: { Authorization: 'Bearer ' + getToken() } }
  );
  if (!res.ok) throw new Error(`Ganson error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.credentials;
};

module.exports = { getCredentials, getServiceCredentials };
