-- 005_fix_integrity_issues.sql
-- Fixes: updated_at triggers, deal_tracking uniqueness, pipeline_status index
-- Run this AFTER 004_add_business_url.sql

----------------------------------------------
-- FIX: updated_at trigger (auto-maintain on UPDATE)
----------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_deal_tracking_updated_at
  BEFORE UPDATE ON public.deal_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

----------------------------------------------
-- FIX: Prevent duplicate deal_tracking per business
----------------------------------------------
ALTER TABLE public.deal_tracking
  ADD CONSTRAINT deal_tracking_business_id_unique UNIQUE (business_id);

----------------------------------------------
-- FIX: Index for pipeline status queries (partial, only running rows)
----------------------------------------------
CREATE INDEX idx_landing_pages_running
  ON public.landing_pages(pipeline_status)
  WHERE pipeline_status = 'running';
