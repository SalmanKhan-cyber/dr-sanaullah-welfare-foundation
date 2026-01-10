-- Add donor_name and donor_email columns to donations table
alter table public.donations
add column if not exists donor_name text,
add column if not exists donor_email text;

