-- Add donor identification fields to donations table
alter table public.donations
add column if not exists donor_type text check (donor_type in ('local', 'international')),
add column if not exists cnic text,
add column if not exists passport_number text;

