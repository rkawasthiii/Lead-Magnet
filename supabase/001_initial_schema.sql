-- 001_initial_schema.sql
-- LeadGen Machine — Initial database setup
-- Run this FIRST in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

----------------------------------------------
-- TABLE: user_settings
-- Stores per-user Bedrock credentials
----------------------------------------------
create table public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  bearer_token text,
  model_id text default 'us.anthropic.claude-opus-4-6-v1[1m]',
  aws_region text default 'us-east-1',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

----------------------------------------------
-- TABLE: businesses
-- Top-level entity — one per prospect
----------------------------------------------
create table public.businesses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  niche text,
  city text,
  status text default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

----------------------------------------------
-- TABLE: landing_pages
-- Pipeline data per business landing page
----------------------------------------------
create table public.landing_pages (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  url text,
  raw_copy text,
  scrape_status text default 'pending' not null,
  scraped_data jsonb,
  audit_result jsonb,
  copy_result text,
  lead_magnet_result jsonb,
  outreach_result jsonb,
  pipeline_status text default 'idle' not null,
  current_step text,
  error_message text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

----------------------------------------------
-- TABLE: deal_tracking
-- 9-step checklist per business deal
----------------------------------------------
create table public.deal_tracking (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  deal_status text default 'prospecting' not null,
  loom_sent boolean default false not null,
  loom_sent_at timestamptz,
  dm_replied boolean default false not null,
  dm_replied_at timestamptz,
  wise_link_sent boolean default false not null,
  wise_link_sent_at timestamptz,
  payment_received boolean default false not null,
  payment_received_at timestamptz,
  payment_amount numeric(10,2),
  google_doc_written boolean default false not null,
  google_doc_written_at timestamptz,
  lead_magnet_created boolean default false not null,
  lead_magnet_created_at timestamptz,
  delivered_via_dm boolean default false not null,
  delivered_via_dm_at timestamptz,
  testimonial_asked boolean default false not null,
  testimonial_asked_at timestamptz,
  testimonial_received boolean default false not null,
  testimonial_received_at timestamptz,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

----------------------------------------------
-- TABLE: skills
-- Editable AI instruction prompts per user
----------------------------------------------
create table public.skills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  content text not null,
  is_default boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint skills_user_id_name_key unique (user_id, name)
);

----------------------------------------------
-- INDEXES
----------------------------------------------
create index idx_businesses_user_id on public.businesses(user_id);
create index idx_landing_pages_business_id on public.landing_pages(business_id);
create index idx_deal_tracking_business_id on public.deal_tracking(business_id);
create index idx_skills_user_id on public.skills(user_id);
