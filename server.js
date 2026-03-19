require('dotenv').config();
const express = require('express');
const path    = require('path');
const app     = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

const ADMIN_PASS   = process.env.GANSON_ADMIN_PASS || 'changeme';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const sb = (path, opts={}) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
  headers: {'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', ...opts.headers},
  ...opts
}).then(r => r.json());

const authToken = () => Buffer.from(ADMIN_PASS+':gansonstreet').toString('base64');

const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if(auth !== 'Bearer '+authToken()) return res.status(401).json({error:'Unauthorized'});
  next();
};

app.get('/',    (req,res) => res.sendFile(path.join(__dirname,'login.html')));
app.get('/admin',(req,res) => res.sendFile(path.join(__dirname,'admin.html')));

app.post('/auth', (req,res) => {
  const {password} = req.body;
  if(password === ADMIN_PASS) res.json({success:true, token: authToken()});
  else res.status(401).json({success:false, error:'Invalid password'});
});

app.get('/api/config', requireAuth, (req,res) => {
  res.json({supabase_url: SUPABASE_URL, supabase_key: SUPABASE_KEY});
});

// GET /api/credentials/:client_slug
// Returns all active credentials for a client as a flat key/value object
// Used by apps to load their config at startup
app.get('/api/credentials/:client', requireAuth, async (req,res) => {
  try {
    const {client} = req.params;
    const {env} = req.query; // optional ?env=production

    // Find client by domain or name slug
    const clients = await sb(`sc_clients?or=(domain.eq.${client},name.ilike.*${client}*)&active=eq.true&limit=1`);
    if(!clients.length) return res.status(404).json({error:`Client not found: ${client}`});

    const clientId = clients[0].id;
    let query = `sc_credentials?client_id=eq.${clientId}&active=eq.true&select=key_name,key_value,environment,sc_services(name,slug)`;
    if(env) query += `&environment=eq.${env}`;

    const creds = await sb(query);

    // Return as flat key/value object
    const result = {};
    creds.forEach(c => { result[c.key_name] = c.key_value; });

    res.json({
      client: clients[0].name,
      environment: env || 'all',
      credentials: result,
      count: creds.length
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({error:'Failed to fetch credentials'});
  }
});

// GET /api/credentials/:client/:service
// Returns credentials for a specific service only
app.get('/api/credentials/:client/:service', requireAuth, async (req,res) => {
  try {
    const {client, service} = req.params;

    const clients = await sb(`sc_clients?or=(domain.eq.${client},name.ilike.*${client}*)&active=eq.true&limit=1`);
    if(!clients.length) return res.status(404).json({error:`Client not found: ${client}`});

    const services = await sb(`sc_services?slug=eq.${service}&limit=1`);
    if(!services.length) return res.status(404).json({error:`Service not found: ${service}`});

    const creds = await sb(`sc_credentials?client_id=eq.${clients[0].id}&service_id=eq.${services[0].id}&active=eq.true&select=key_name,key_value`);

    const result = {};
    creds.forEach(c => { result[c.key_name] = c.key_value; });

    res.json({
      client: clients[0].name,
      service: services[0].name,
      credentials: result,
      count: creds.length
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({error:'Failed to fetch credentials'});
  }
});

app.get('/health', (_, res) => res.json({status:'ok', version:'1.0', clients:'gansonstreet-admin'}));

app.listen(3003, () => console.log('GansonStreet Admin running on port 3003'));
