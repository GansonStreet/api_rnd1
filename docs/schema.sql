CREATE TYPE sc_industry    AS ENUM ('restaurant','parking','healthcare','retail','property','logistics','other');
CREATE TYPE sc_plan        AS ENUM ('starter','growth','custom','enterprise');
CREATE TYPE sc_service_cat AS ENUM ('ai','sms','voice','crm','payment','erp','database','email','social','maps','pos','workflow','storage','analytics','other');
CREATE TYPE sc_auth_type   AS ENUM ('api_key','oauth','bearer','basic','webhook_secret','none');
CREATE TYPE sc_environment AS ENUM ('production','staging','test');
CREATE TYPE sc_agent_cat   AS ENUM ('chat','alert','booking','payment','report','system');
CREATE TYPE sc_http_method AS ENUM ('GET','POST','PUT','PATCH','DELETE');
CREATE TYPE sc_event_type  AS ENUM ('chat','sms','email','workflow_step','api_call','webhook','cron','alert');
CREATE TYPE sc_status      AS ENUM ('success','failed','pending','skipped');

CREATE TABLE sc_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  industry sc_industry DEFAULT 'other',
  contact_name TEXT, contact_email TEXT, contact_phone TEXT,
  active BOOLEAN DEFAULT true,
  plan sc_plan DEFAULT 'starter',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sc_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category sc_service_cat NOT NULL,
  description TEXT, base_url TEXT, docs_url TEXT,
  auth_type sc_auth_type DEFAULT 'api_key',
  logo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sc_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES sc_clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES sc_services(id),
  key_name TEXT NOT NULL,
  key_value TEXT NOT NULL,
  description TEXT,
  environment sc_environment DEFAULT 'production',
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sc_endpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES sc_services(id),
  name TEXT NOT NULL,
  method sc_http_method NOT NULL,
  path TEXT NOT NULL,
  description TEXT, payload JSONB, response JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sc_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT, system_prompt TEXT,
  model TEXT DEFAULT 'claude-sonnet-4-20250514',
  max_tokens INT DEFAULT 600,
  category sc_agent_cat DEFAULT 'chat',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sc_client_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES sc_clients(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES sc_agents(id),
  active BOOLEAN DEFAULT true,
  custom_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sc_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES sc_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT, trigger TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sc_workflow_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES sc_workflows(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  name TEXT NOT NULL, action TEXT NOT NULL,
  service_id UUID REFERENCES sc_services(id),
  config JSONB, on_success TEXT, on_failure TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sc_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES sc_clients(id),
  agent_id UUID REFERENCES sc_agents(id),
  workflow_id UUID REFERENCES sc_workflows(id),
  event_type sc_event_type NOT NULL,
  status sc_status NOT NULL,
  input JSONB, output JSONB, error TEXT, duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sc_sms_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES sc_clients(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  keyword TEXT,
  active BOOLEAN DEFAULT true,
  opted_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, phone)
);
ENDOFFILE
