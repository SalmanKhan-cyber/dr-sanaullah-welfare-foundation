-- Create surgery_categories table for managing surgery types
-- This allows admins to add, edit, and manage surgery categories

create table if not exists public.surgery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null,
  description text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_surgery_categories_display_order on public.surgery_categories(display_order);
create index if not exists idx_surgery_categories_is_active on public.surgery_categories(is_active);

-- Enable RLS
alter table public.surgery_categories enable row level security;

-- RLS Policies
-- Drop existing policies if they exist (to allow re-running this script)
drop policy if exists "Public can view active surgery categories" on public.surgery_categories;
drop policy if exists "Admins can manage all surgery categories" on public.surgery_categories;

-- Public can view active categories
create policy "Public can view active surgery categories"
  on public.surgery_categories for select
  using (is_active = true);

-- Admins can do everything
create policy "Admins can manage all surgery categories"
  on public.surgery_categories for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Insert default surgery categories (only if they don't already exist)
insert into public.surgery_categories (name, icon, description, display_order) values
  ('Piles Surgery', '🔴', 'Treatment for hemorrhoids', 1),
  ('Hip Replacement Surgery', '🦴', 'Hip joint replacement procedure', 2),
  ('Spinal Surgery', '🫀', 'Spine and back surgery', 3),
  ('Tonsillectomy', '👄', 'Tonsil removal surgery', 4),
  ('Appendectomy', '🍑', 'Appendix removal surgery', 5),
  ('Cyst Removal', '🔴', 'Cyst removal procedure', 6),
  ('TURP', '👨', 'Transurethral resection of prostate', 7),
  ('Hydrocele Surgery', '💧', 'Hydrocele treatment', 8),
  ('Lithotripsy', '🫘', 'Kidney stone removal', 9),
  ('Open Heart Surgery', '❤️', 'Cardiac surgery procedures', 10),
  ('Tummy Tuck Surgery', '🏋️', 'Abdominoplasty procedure', 11),
  ('Liver Transplant', '🫀', 'Liver transplantation', 12),
  ('Gall Bladder Surgery', '🟡', 'Cholecystectomy', 13),
  ('Heart Transplant', '❤️‍🩹', 'Heart transplantation', 14),
  ('Prostatectomy', '⚕️', 'Prostate removal surgery', 15),
  ('Laser Lithotripsy', '💎', 'Laser kidney stone treatment', 16),
  ('Penile Implants', '🔵', 'Penile implant procedure', 17),
  ('Anal Fissure Treatment', '🔴', 'Anal fissure surgery', 18),
  ('Vasectomy', '⚪', 'Male sterilization procedure', 19),
  ('Hernia Surgery', '🟢', 'Hernia repair surgery', 20),
  ('Circumcision', '🔵', 'Circumcision procedure', 21),
  ('Fistula', '🔴', 'Fistula treatment', 22),
  ('Cataract Eye Surgery', '👁️', 'Cataract removal surgery', 23),
  ('Renal Transplant', '🫘', 'Kidney transplantation', 24)
on conflict (name) do nothing;

