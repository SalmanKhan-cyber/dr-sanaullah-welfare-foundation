-- Demo Doctors for Dr. Sanaullah Welfare Foundation
-- Execute this in Supabase SQL Editor

-- Ensure degrees column exists
alter table if exists public.doctors add column if not exists degrees text;

-- Insert demo doctors with degrees
INSERT INTO public.doctors (name, specialization, discount_rate, degrees) VALUES
('Dr. Ahmed Ali Khan', 'Cardiologist', 50.00, 'MBBS, FCPS (Cardiology)'),
('Dr. Fatima Noor', 'Pediatrician', 50.00, 'MBBS, FCPS (Pediatrics)'),
('Dr. Hassan Mahmood', 'Orthopedic Surgeon', 50.00, 'MBBS, MS (Orthopedics)'),
('Dr. Ayesha Siddiqui', 'Gynecologist', 50.00, 'MBBS, FCPS (Gynecology)'),
('Dr. Bilal Qureshi', 'Dermatologist', 50.00, 'MBBS, FCPS (Dermatology)'),
('Dr. Zainab Rasheed', 'General Physician', 50.00, 'MBBS, MRCGP'),
('Dr. Usman Farooq', 'Neurologist', 50.00, 'MBBS, FCPS (Neurology)'),
('Dr. Mariam Khalid', 'Ophthalmologist', 50.00, 'MBBS, FCPS (Ophthalmology)'),
('Dr. Saad Jameel', 'ENT Specialist', 50.00, 'MBBS, FCPS (ENT)'),
('Dr. Hina Tariq', 'Psychiatrist', 50.00, 'MBBS, FCPS (Psychiatry)'),
('Dr. Imran Shah', 'Urologist', 50.00, 'MBBS, FCPS (Urology)'),
('Dr. Sana Malik', 'Radiologist', 50.00, 'MBBS, FCPS (Radiology)')
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT id, name, specialization, discount_rate 
FROM public.doctors 
ORDER BY name;

