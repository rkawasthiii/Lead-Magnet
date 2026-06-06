-- 002_enable_rls.sql
-- Enable Row Level Security on all tables
-- Run this AFTER 001_initial_schema.sql

----------------------------------------------
-- ENABLE RLS
----------------------------------------------
alter table public.user_settings enable row level security;
alter table public.businesses enable row level security;
alter table public.landing_pages enable row level security;
alter table public.deal_tracking enable row level security;
alter table public.skills enable row level security;

----------------------------------------------
-- POLICIES: user_settings
----------------------------------------------
create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_settings_delete_own"
  on public.user_settings for delete
  using (auth.uid() = user_id);

----------------------------------------------
-- POLICIES: businesses
----------------------------------------------
create policy "businesses_select_own"
  on public.businesses for select
  using (auth.uid() = user_id);

create policy "businesses_insert_own"
  on public.businesses for insert
  with check (auth.uid() = user_id);

create policy "businesses_update_own"
  on public.businesses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "businesses_delete_own"
  on public.businesses for delete
  using (auth.uid() = user_id);

----------------------------------------------
-- POLICIES: landing_pages
----------------------------------------------
create policy "landing_pages_select_own"
  on public.landing_pages for select
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "landing_pages_insert_own"
  on public.landing_pages for insert
  with check (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "landing_pages_update_own"
  on public.landing_pages for update
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  )
  with check (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "landing_pages_delete_own"
  on public.landing_pages for delete
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

----------------------------------------------
-- POLICIES: deal_tracking
----------------------------------------------
create policy "deal_tracking_select_own"
  on public.deal_tracking for select
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "deal_tracking_insert_own"
  on public.deal_tracking for insert
  with check (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "deal_tracking_update_own"
  on public.deal_tracking for update
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  )
  with check (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "deal_tracking_delete_own"
  on public.deal_tracking for delete
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

----------------------------------------------
-- POLICIES: skills
----------------------------------------------
create policy "skills_select_own"
  on public.skills for select
  using (auth.uid() = user_id);

create policy "skills_insert_own"
  on public.skills for insert
  with check (auth.uid() = user_id);

create policy "skills_update_own"
  on public.skills for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "skills_delete_own"
  on public.skills for delete
  using (auth.uid() = user_id);
