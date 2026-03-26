-- Sessions table for USSD state machine
-- Stores minimal, privacy-preserving session state for in-progress USSD interactions

CREATE TABLE IF NOT EXISTS public.ussd_sessions (
  session_id TEXT PRIMARY KEY,
  hashed_phone TEXT NOT NULL,
  current_step TEXT NOT NULL DEFAULT 'selecting_language',
  temp_data JSONB DEFAULT '{}'::jsonb,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ussd_sessions_hashed_phone ON public.ussd_sessions(hashed_phone);

-- Function: find active session by session_id or hashed_phone within a time window (e.g., last 5 minutes)
CREATE OR REPLACE FUNCTION public.get_active_session(p_session_id TEXT, p_hashed_phone TEXT, p_minutes INT DEFAULT 5)
RETURNS TABLE(session_id TEXT, hashed_phone TEXT, current_step TEXT, temp_data JSONB, last_activity TIMESTAMPTZ, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT session_id, hashed_phone, current_step, temp_data, last_activity, created_at
  FROM public.ussd_sessions
  WHERE (
    (p_session_id IS NOT NULL AND session_id = p_session_id)
    OR (p_hashed_phone IS NOT NULL AND hashed_phone = p_hashed_phone)
  )
  AND last_activity > (now() - (p_minutes || ' minutes')::interval)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Upsert helper to create or update session state
CREATE OR REPLACE FUNCTION public.upsert_ussd_session(p_session_id TEXT, p_hashed_phone TEXT, p_current_step TEXT, p_temp_data JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.ussd_sessions(session_id, hashed_phone, current_step, temp_data, last_activity)
    VALUES (p_session_id, p_hashed_phone, p_current_step, p_temp_data, now())
  ON CONFLICT (session_id) DO UPDATE SET
    hashed_phone = EXCLUDED.hashed_phone,
    current_step = EXCLUDED.current_step,
    temp_data = EXCLUDED.temp_data,
    last_activity = now();
END;
$$ LANGUAGE plpgsql;
