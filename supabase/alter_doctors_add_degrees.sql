-- Add degrees column to doctors table and populate demo values
-- Run this in the Supabase SQL editor

-- 1) Add the column if it does not exist
alter table if exists public.doctors
add column if not exists degrees text;

-- 2) Optionally update existing demo doctors with degrees
update public.doctors set degrees = 'MBBS, FCPS (Cardiology)'
where specialization = 'Cardiologist' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, FCPS (Pediatrics)'
where specialization = 'Pediatrician' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, MS (Orthopedics)'
where specialization = 'Orthopedic Surgeon' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, FCPS (Gynecology)'
where specialization = 'Gynecologist' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, FCPS (Dermatology)'
where specialization = 'Dermatologist' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, MRCGP'
where specialization = 'General Physician' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, FCPS (Neurology)'
where specialization = 'Neurologist' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, FCPS (Ophthalmology)'
where specialization = 'Ophthalmologist' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, FCPS (ENT)'
where specialization = 'ENT Specialist' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, FCPS (Psychiatry)'
where specialization = 'Psychiatrist' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, FCPS (Urology)'
where specialization = 'Urologist' and (degrees is null or degrees = '');

update public.doctors set degrees = 'MBBS, FCPS (Radiology)'
where specialization = 'Radiologist' and (degrees is null or degrees = '');

-- 3) Verify
select id, name, specialization, degrees from public.doctors order by name;


