-- Create test_bookings table for lab test bookings
create table if not exists public.test_bookings (
  id uuid primary key default gen_random_uuid(),
  tracking_number text unique, -- Unique tracking number for search (auto-generated)
  patient_id uuid references public.users(id) on delete set null,
  lab_id uuid references public.labs(id) on delete set null,
  test_name text not null, -- e.g., "Blood Tests", "X-Ray", "Ultrasound"
  test_description text,
  status text check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) default 'pending',
  prescription_url text, -- URL to uploaded prescription file
  test_result_url text, -- URL to uploaded test result file
  remarks text,
  booked_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index on tracking_number for fast searches
create index if not exists idx_test_bookings_tracking_number on public.test_bookings(tracking_number);
create index if not exists idx_test_bookings_patient_id on public.test_bookings(patient_id);
create index if not exists idx_test_bookings_lab_id on public.test_bookings(lab_id);
create index if not exists idx_test_bookings_status on public.test_bookings(status);

-- Function to generate unique tracking number
create or replace function generate_tracking_number()
returns text as $$
declare
  new_number text;
  exists_check boolean;
begin
  loop
    -- Generate 8-character alphanumeric tracking number
    new_number := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if it already exists
    select exists(select 1 from public.test_bookings where tracking_number = new_number) into exists_check;
    
    -- If unique, exit loop
    exit when not exists_check;
  end loop;
  
  return new_number;
end;
$$ language plpgsql;

-- Trigger to auto-generate tracking number before insert
create or replace function set_tracking_number()
returns trigger as $$
begin
  if new.tracking_number is null or new.tracking_number = '' then
    new.tracking_number := generate_tracking_number();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trigger_set_tracking_number
  before insert on public.test_bookings
  for each row
  execute function set_tracking_number();

-- Enable RLS
alter table public.test_bookings enable row level security;

-- RLS Policies
-- Patients can view their own bookings
create policy "Patients can view their own bookings"
  on public.test_bookings for select
  using (patient_id = auth.uid());

-- Labs can view bookings assigned to them
create policy "Labs can view their bookings"
  on public.test_bookings for select
  using (
    lab_id in (
      select lab_id from public.lab_users where user_id = auth.uid()
    )
  );

-- Patients can create bookings
create policy "Patients can create bookings"
  on public.test_bookings for insert
  with check (patient_id = auth.uid());

-- Labs can update their bookings
create policy "Labs can update their bookings"
  on public.test_bookings for update
  using (
    lab_id in (
      select lab_id from public.lab_users where user_id = auth.uid()
    )
  );

-- Admins can do everything
create policy "Admins can manage all bookings"
  on public.test_bookings for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

