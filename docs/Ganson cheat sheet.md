# Ganson Master Cheat Sheet

---

## Where Everything Lives

| What | Where | How to create |
|------|-------|---------------|
| `ganson.js` | GitHub + every project on droplet | `curl` to download |
| `.env` | Droplet only — NEVER GitHub | `nano` on droplet |
| `CLAUDE_STARTER.md` | GitHub online | Create in browser at github.com |
| Session starter prompt | Claude Projects | Paste into Project Instructions |

---

## Admin Console
```
URL:      https://admin.gansonstreet.com
Password: (your Ganson admin password)
```

---

## Client Slugs
| Project | Slug | Keys Available |
|---------|------|----------------|
| Marios Bistro & Brews | `mario` | Anthropic, Twilio, GitHub |
| BNMC Parking | `bnmc` | Anthropic, Supabase |
| Ganson | `ganson` | Anthropic, GitHub, Supabase |

---

## Starting a New Project — Every Time

### Step 1 — Create project folder on droplet
```bash
mkdir /var/www/your-project
cd /var/www/your-project
```

### Step 2 — Pull ganson.js from GitHub
```bash
curl -o ganson.js https://raw.githubusercontent.com/GansonStreet/api_rnd1/main/ganson.js
```

### Step 3 — Create .env (only 2 lines, nothing else)
```bash
nano .env
```
```env
GANSON_URL=https://admin.gansonstreet.com
GANSON_PASS=YourPassword
```
Save: `CTRL+X` → `Y` → `Enter`

### Step 4 — Install dependencies
```bash
npm install dotenv
```

### Step 5 — Use in your app
```js
const { getCredentials, getServiceCredentials } = require('./ganson');

(async () => {
  // Load ALL keys for a client — always pass client name explicitly
  const creds = await getCredentials('mario');

  // Use keys
  creds.ANTHROPIC_API_KEY
  creds.TWILIO_SID
  creds.TWILIO_TOKEN
  creds.TWILIO_FROM
  creds.SUPABASE_URL
  creds.SUPABASE_KEY

  // Load keys for ONE service only (optional)
  const twilioKeys = await getServiceCredentials('twilio', 'mario');

  // rest of app...
})();
```

### Step 6 — Start with pm2
```bash
pm2 start server.js --name your-project
pm2 save
```

---

## .gitignore — Always Add This
```
.env
node_modules/
```
**Never commit `.env` to GitHub — it contains your Ganson password.**

---

## Claude Session Starter — Paste at Top of Every New Chat
```
I'm building a Node.js app. My API keys are in Ganson.

Ganson URL:  https://admin.gansonstreet.com
Ganson Pass: (your password)

.env contains ONLY:
GANSON_URL=https://admin.gansonstreet.com
GANSON_PASS=YourPassword

Get ganson.js:
curl -o ganson.js https://raw.githubusercontent.com/GansonStreet/api_rnd1/main/ganson.js

Clients:
- mario  → ANTHROPIC_API_KEY, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, GITHUB_TOKEN
- bnmc   → ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY
- ganson → ANTHROPIC_API_KEY, GITHUB_TOKEN, SUPABASE_URL, SUPABASE_KEY

Rules:
1. NEVER hardcode API keys
2. ALWAYS use getCredentials('clientname') — client name always required
3. ALWAYS wrap in async IIFE at top level
4. ALWAYS require('dotenv').config() at top of every file
```

---

## Droplet Quick Reference
| Item | Value |
|------|-------|
| Server | DigitalOcean ubuntu-s-1vcpu-1gb-nyc3-01 |
| Ganson Admin Path | `/var/www/gansonstreet-admin` |
| Ganson Admin Port | 3003 |
| Ganson PM2 ID | 6 |
| GitHub Repo | github.com/GansonStreet/api_rnd1 |

### Useful Droplet Commands
```bash
pm2 list                               # see all running servers
pm2 logs 6                             # live logs for Ganson admin
pm2 restart 6                          # restart Ganson admin
cat /var/www/gansonstreet-admin/.env   # check env vars
nginx -t && systemctl reload nginx     # test and reload Nginx
```

### Adding New Keys to a Client
1. Log into https://admin.gansonstreet.com
2. Find the client (mario, bnmc, ganson)
3. Add key name + value
4. Call `getCredentials()` in your app — available instantly, no redeploy needed
