-- 003_update_default_model_id.sql
-- Update default model ID to remove [1m] suffix (not a valid Bedrock model identifier)
-- The 1M context window is automatic for this model — no suffix needed
-- Run this AFTER 002_enable_rls.sql

alter table public.user_settings
  alter column model_id set default 'us.anthropic.claude-opus-4-6-v1';

-- Update any existing rows that still have the old default
update public.user_settings
  set model_id = 'us.anthropic.claude-opus-4-6-v1'
  where model_id = 'us.anthropic.claude-opus-4-6-v1[1m]';
