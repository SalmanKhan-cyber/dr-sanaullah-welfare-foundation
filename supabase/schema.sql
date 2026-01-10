-- Core schema for Dr. Sanaullah Welfare Foundation
-- Execute in Supabase SQL editor or via CLI

create table if not exists public.users (
  id uuid primary key default auth.uid(),
  name text,
  email text unique,
  phone text unique,
  role text check (role in ('patient','donor','admin','lab','student','teacher','pharmacy')),
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.patients (
  user_id uuid primary key references public.users(id) on delete cascade,
  gender text check (gender in ('male','female','other')),
  age int,
  cnic text,
  history text
);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialization text,
  discount_rate numeric(5,2) default 50.00
);

create table if not exists public.lab_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(user_id) on delete cascade,
  file_url text not null,
  report_date date default now(),
  remarks text
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references public.users(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  purpose text,
  receipt_url text,
  created_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  trainer_id uuid references public.users(id) on delete set null,
  discount_rate numeric(5,2) default 70.00,
  duration text
);

create table if not exists public.students (
  user_id uuid references public.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  progress numeric(5,2) default 0.00,
  certificate_url text,
  primary key (user_id, course_id)
);

create table if not exists public.teachers (
  user_id uuid primary key references public.users(id) on delete cascade,
  specialization text
);

create table if not exists public.pharmacy_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stock int default 0,
  expiry date,
  discount_rate numeric(5,2) default 50.00
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(user_id) on delete set null,
  doctor_id uuid references public.doctors(id) on delete set null,
  pharmacy_item_id uuid references public.pharmacy_items(id) on delete set null,
  file_url text,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now(),
  read boolean default false
);

create table if not exists public.logs (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  timestamp timestamptz default now()
);

-- Basic RLS policies
alter table public.users enable row level security;
alter table public.patients enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (id = auth.uid());

create policy "Users can update their own profile"
  on public.users for update
  using (id = auth.uid());

create policy "Patients can view/update their patient row"
  on public.patients for select using (user_id = auth.uid());
create policy "Patients can view/update their patient row upd"
  on public.patients for update using (user_id = auth.uid());

-- Admin helper role via Supabase: use service role key server-side for elevated ops.
