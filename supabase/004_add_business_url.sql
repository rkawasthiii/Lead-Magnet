-- 004_add_business_url.sql
-- Add website URL column to businesses table
-- This stores the business's main site URL for reference

alter table public.businesses
  add column website_url text;
