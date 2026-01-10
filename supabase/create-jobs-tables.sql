-- Create jobs and job_applications tables
-- Run this in Supabase SQL Editor

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    department text,
    description text NOT NULL,
    requirements text,
    location text,
    employment_type text CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')) DEFAULT 'full-time',
    salary_range text,
    experience_required text,
    education_required text,
    is_active boolean DEFAULT true,
    posted_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    applicant_name text NOT NULL,
    applicant_email text NOT NULL,
    applicant_phone text NOT NULL,
    applicant_cv_url text,
    cover_letter text,
    status text CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'interview_scheduled', 'rejected', 'hired')) DEFAULT 'pending',
    interview_date timestamptz,
    interview_notes text,
    admin_notes text,
    contacted boolean DEFAULT false,
    contacted_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON public.job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Allow all operations on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public to view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow all operations on job_applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;

-- RLS policies for jobs
-- Allow all operations for backend service role (admin operations)
CREATE POLICY "Allow all operations on jobs" ON public.jobs
  FOR ALL USING (true) WITH CHECK (true);

-- Allow public to view active jobs (for job listings)
CREATE POLICY "Allow public to view active jobs" ON public.jobs
  FOR SELECT USING (is_active = true);

-- RLS policies for job_applications
-- Allow all operations for backend service role (admin operations)
CREATE POLICY "Allow all operations on job_applications" ON public.job_applications
  FOR ALL USING (true) WITH CHECK (true);

-- Allow users to view their own applications
CREATE POLICY "Users can view their own applications" ON public.job_applications
  FOR SELECT USING (applicant_id = auth.uid());

