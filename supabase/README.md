# Supabase Migrations

Run these in order in your Supabase SQL Editor.

| File | What it does | Run when |
|------|-------------|----------|
| `001_initial_schema.sql` | Creates all 5 tables + indexes | First time setup |
| `002_enable_rls.sql` | Enables RLS + creates all policies | Immediately after 001 |
| `003_update_default_model_id.sql` | Fixes default model ID (removes `[1m]` suffix) | After 002, or anytime to fix existing rows |
| `004_add_business_url.sql` | Adds `website_url` column to businesses | After 003 |

## How to run

1. Go to your Supabase project → **SQL Editor**
2. Open `001_initial_schema.sql`, paste contents, click **Run**
3. Open `002_enable_rls.sql`, paste contents, click **Run**
4. Open `003_update_default_model_id.sql`, paste contents, click **Run**
5. Open `004_add_business_url.sql`, paste contents, click **Run**

All must succeed with no errors before using the app.
