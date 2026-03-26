-- Trigger: When a responder inserts the first case_note for a report,
-- automatically set the report.status to 'In Progress'.

CREATE OR REPLACE FUNCTION public.fn_case_note_mark_in_progress()
RETURNS trigger AS $$
BEGIN
  -- Only act when a responder (not system) creates a note; adjust as needed.
  PERFORM 1 FROM public.case_notes WHERE report_id = NEW.report_id LIMIT 1;
  -- If there was already a note (including the one being inserted), skip.
  -- We want to change status when this is the FIRST note for the report.
  IF (SELECT count(1) FROM public.case_notes WHERE report_id = NEW.report_id) = 1 THEN
    UPDATE public.reports SET status = 'In Progress' WHERE id = NEW.report_id AND status = 'New';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger after insert
DROP TRIGGER IF EXISTS case_notes_after_insert ON public.case_notes;
CREATE TRIGGER case_notes_after_insert
AFTER INSERT ON public.case_notes
FOR EACH ROW EXECUTE FUNCTION public.fn_case_note_mark_in_progress();
