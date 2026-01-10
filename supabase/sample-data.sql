-- Sample data for Dr. Sanaullah Welfare Foundation
-- Run this AFTER creating users via the signup process
-- Replace USER_IDs with actual IDs from your Supabase Auth users

-- ============================================
-- SAMPLE DOCTORS
-- ============================================

INSERT INTO public.doctors (name, specialization, discount_rate) VALUES
  ('Dr. Ahmed Khan', 'General Physician', 50.00),
  ('Dr. Fatima Ali', 'Pediatrician', 50.00),
  ('Dr. Hassan Raza', 'Cardiologist', 50.00),
  ('Dr. Ayesha Malik', 'Gynecologist', 50.00),
  ('Dr. Bilal Ahmed', 'Orthopedic Surgeon', 50.00);

-- ============================================
-- SAMPLE PHARMACY ITEMS
-- ============================================

INSERT INTO public.pharmacy_items (name, stock, expiry, discount_rate) VALUES
  ('Paracetamol 500mg', 1000, '2025-12-31', 50.00),
  ('Ibuprofen 400mg', 800, '2025-11-30', 50.00),
  ('Amoxicillin 250mg', 500, '2025-10-31', 50.00),
  ('Cetirizine 10mg', 600, '2025-09-30', 50.00),
  ('Omeprazole 20mg', 400, '2025-08-31', 50.00),
  ('Metformin 500mg', 750, '2025-12-31', 50.00),
  ('Vitamin D3 1000IU', 900, '2026-01-31', 50.00),
  ('Cough Syrup', 200, '2025-06-30', 50.00);

-- ============================================
-- SAMPLE COURSES
-- ============================================
-- Note: Replace 'TEACHER_USER_ID' with actual teacher user ID

INSERT INTO public.courses (title, description, trainer_id, discount_rate, duration) VALUES
  (
    'Ultrasound Technician Training',
    'Complete training program for ultrasound technicians covering all aspects of sonography.',
    NULL, -- Set teacher ID after creating teacher user
    70.00,
    '3 months'
  ),
  (
    'ECG Technician Course',
    'Learn to perform and interpret electrocardiograms with hands-on practice.',
    NULL,
    70.00,
    '2 months'
  ),
  (
    'Medical Lab Technology',
    'Comprehensive lab technician training including blood tests, urinalysis, and more.',
    NULL,
    70.00,
    '6 months'
  ),
  (
    'First Aid & Emergency Care',
    'Essential first aid skills and emergency response training.',
    NULL,
    70.00,
    '1 month'
  ),
  (
    'Pharmacy Assistant Training',
    'Learn pharmaceutical basics, inventory management, and prescription handling.',
    NULL,
    70.00,
    '4 months'
  );

-- ============================================
-- SAMPLE NOTIFICATIONS (for testing)
-- ============================================
-- Note: Replace 'USER_ID' with actual user IDs after signup

-- INSERT INTO public.notifications (user_id, message, read) VALUES
--   ('USER_ID_HERE', 'Welcome to Dr. Sanaullah Welfare Foundation!', false),
--   ('USER_ID_HERE', 'Your profile has been verified.', false);

-- ============================================
-- UPDATE COURSE TRAINERS (after creating teacher users)
-- ============================================

-- UPDATE public.courses 
-- SET trainer_id = 'TEACHER_USER_ID_HERE'
-- WHERE title = 'Ultrasound Technician Training';

-- ============================================
-- VERIFY DATA
-- ============================================

-- Check doctors
SELECT * FROM public.doctors;

-- Check pharmacy items
SELECT * FROM public.pharmacy_items;

-- Check courses
SELECT * FROM public.courses;

-- Check users (from Auth)
-- SELECT * FROM auth.users;

-- ============================================
-- NOTES
-- ============================================

/*
1. Create users first via the signup form or Supabase Auth
2. Set their roles in user_metadata
3. Then run this SQL to populate sample data
4. For patient-specific data, you'll need actual patient user IDs
5. For enrollments, donations, etc., use the API or UI after login

Sample flow:
- Sign up users → Set roles → Run this SQL → Test features via UI/API
*/

