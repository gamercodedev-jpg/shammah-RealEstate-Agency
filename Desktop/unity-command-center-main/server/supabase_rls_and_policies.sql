-- Supabase RLS and supporting objects for SafeReport (demo)
-- NOTE: Review and adapt to your auth claims and deployment.

-- Table assumptions: reports(id, profile_id, province, reporter_name, reporter_phone, description, status, created_at)
-- profiles(id, user_id, role, province)
-- case_notes(id, report_id, author_id, note_text, created_at)
-- audit_logs(id, actor_id, report_id, action, reason, created_at)

-- 1) Create a redacted view that excludes PII
CREATE OR REPLACE VIEW public.reports_redacted AS
SELECT id, profile_id, province, description, status, created_at
FROM public.reports;

-- 2) Ensure RLS is enabled on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3) Policy: Allow inserts for role = 'survivor' (via JWT claim 'role')
CREATE POLICY reports_insert_survivor ON public.reports
  FOR INSERT
  USING (true)
  WITH CHECK (current_setting('jwt.claims.role', true) = 'survivor');

-- 4) Policy: Prevent survivors from selecting/listing reports
CREATE POLICY reports_select_no_survivor ON public.reports
  FOR SELECT
  USING (current_setting('jwt.claims.role', true) <> 'survivor');

-- 5) Policy: Responders can only select reports matching their province
-- Assumes JWT includes a 'province' claim for responders
CREATE POLICY reports_select_responder_province ON public.reports
  FOR SELECT
  USING (
    current_setting('jwt.claims.role', true) = 'responder'
    AND (current_setting('jwt.claims.province', true) = province)
  );

-- 6) Admins may have restricted select on redacted view, not raw PII.
-- We rely on `reports_redacted` for dashboard listing; direct access to `reports` PII
-- requires an explicit audit-recorded request via a SECURITY DEFINER function.

-- 7) Audit-aware accessor: returns PII only after inserting an audit log entry.
CREATE OR REPLACE FUNCTION public.request_report_pii(p_report_id uuid, p_reason text)
RETURNS TABLE(reporter_name text, reporter_phone text) AS $$
DECLARE
  actor text := current_setting('jwt.claims.sub', true);
BEGIN
  -- insert audit record
  INSERT INTO public.audit_logs(actor_id, report_id, action, reason, created_at)
  VALUES (actor::uuid, p_report_id, 'PII_VIEW', p_reason, now());

  -- Return the PII (caller must have permission via a separate policy)
  RETURN QUERY
  SELECT reporter_name, reporter_phone FROM public.reports WHERE id = p_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8) Restrict direct SELECT on PII columns via a policy that requires a session flag
-- This pattern is advisory: your app should call `request_report_pii()` which creates an audit entry.
-- Policy allowing select of reports only when the JWT has claim `can_view_pii` = 'true'
CREATE POLICY reports_select_pii_by_audit ON public.reports
  FOR SELECT
  USING (current_setting('jwt.claims.can_view_pii', true) = 'true');

-- Important notes:
-- - Supabase JWT claims are set at authentication time. For short-lived audit grants,
--   consider implementing a server-side mediator (Edge Function) that records the audit
--   and returns the PII result to the authenticated caller without embedding a long-lived claim.
-- - Do NOT grant broad access to `request_report_pii`; keep it scoped and monitor audit_logs.
