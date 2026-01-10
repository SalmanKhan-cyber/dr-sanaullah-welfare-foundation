-- Add additional fields to courses table for better course management
-- This allows courses to have pricing, icons, and categories

-- Add original_price column
alter table if exists public.courses 
add column if not exists original_price numeric(10,2);

-- Add icon column
alter table if exists public.courses 
add column if not exists icon text;

-- Add category column
alter table if exists public.courses 
add column if not exists category text;

-- Update existing courses with default values if needed
update public.courses 
set 
  original_price = 50000,
  icon = '🩺',
  category = 'Medical'
where original_price is null or icon is null or category is null;

