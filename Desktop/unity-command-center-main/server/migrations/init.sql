-- Init SQL for SafeReport demo
CREATE TABLE IF NOT EXISTS responders (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  zone TEXT,
  province TEXT,
  status TEXT,
  phone TEXT,
  cases_handled INT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  incident_type TEXT,
  province TEXT,
  district TEXT,
  description TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  assigned_responder TEXT,
  ai_summary TEXT,
  report_channel TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  victim_phone_encrypted TEXT,
  victim_phone_iv TEXT,
  victim_phone_tag TEXT,
  encrypted_dek JSONB,
  victim_address_encrypted TEXT,
  victim_address_iv TEXT,
  victim_address_tag TEXT,
  encrypted_dek_address JSONB
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action TEXT,
  case_id TEXT,
  user_id TEXT,
  role TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE
);
