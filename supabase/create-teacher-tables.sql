-- Create tables for teacher features: materials, announcements, assignments
-- Run this in Supabase SQL Editor

-- Course Materials table
create table if not exists public.course_materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  teacher_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  file_url text,
  file_name text,
  file_type text,
  file_size bigint,
  material_type text check (material_type in ('document', 'video', 'link', 'other')) default 'document',
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Course Announcements table
create table if not exists public.course_announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  teacher_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  priority text check (priority in ('low', 'normal', 'high', 'urgent')) default 'normal',
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Course Assignments table
create table if not exists public.course_assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  teacher_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  instructions text,
  file_url text,
  file_name text,
  due_date timestamptz,
  max_score numeric(10,2) default 100.00,
  assignment_type text check (assignment_type in ('homework', 'quiz', 'project', 'exam', 'other')) default 'homework',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Assignment Submissions table
create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.course_assignments(id) on delete cascade not null,
  student_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  file_url text,
  file_name text,
  submission_text text,
  score numeric(10,2),
  feedback text,
  status text check (status in ('submitted', 'graded', 'returned')) default 'submitted',
  submitted_at timestamptz default now(),
  graded_at timestamptz,
  unique (assignment_id, student_id)
);

-- Enable RLS
alter table public.course_materials enable row level security;
alter table public.course_announcements enable row level security;
alter table public.course_assignments enable row level security;
alter table public.assignment_submissions enable row level security;

-- RLS Policies for course_materials
create policy "Teachers can manage their course materials"
  on public.course_materials for all
  using (
    teacher_id = auth.uid() or
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Students can view active course materials"
  on public.course_materials for select
  using (
    is_active = true and
    exists (
      select 1 from public.students
      where students.course_id = course_materials.course_id
      and students.user_id = auth.uid()
    )
  );

-- RLS Policies for course_announcements
create policy "Teachers can manage their course announcements"
  on public.course_announcements for all
  using (
    teacher_id = auth.uid() or
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Students can view course announcements"
  on public.course_announcements for select
  using (
    exists (
      select 1 from public.students
      where students.course_id = course_announcements.course_id
      and students.user_id = auth.uid()
    )
  );

-- RLS Policies for course_assignments
create policy "Teachers can manage their course assignments"
  on public.course_assignments for all
  using (
    teacher_id = auth.uid() or
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Students can view active course assignments"
  on public.course_assignments for select
  using (
    is_active = true and
    exists (
      select 1 from public.students
      where students.course_id = course_assignments.course_id
      and students.user_id = auth.uid()
    )
  );

-- RLS Policies for assignment_submissions
create policy "Students can manage their own submissions"
  on public.assignment_submissions for all
  using (student_id = auth.uid());

create policy "Teachers can view and grade submissions for their courses"
  on public.assignment_submissions for select
  using (
    exists (
      select 1 from public.course_assignments
      where course_assignments.id = assignment_submissions.assignment_id
      and course_assignments.teacher_id = auth.uid()
    ) or
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Teachers can update submissions for their courses"
  on public.assignment_submissions for update
  using (
    exists (
      select 1 from public.course_assignments
      where course_assignments.id = assignment_submissions.assignment_id
      and course_assignments.teacher_id = auth.uid()
    ) or
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Create indexes for better performance
create index if not exists idx_course_materials_course_id on public.course_materials(course_id);
create index if not exists idx_course_materials_teacher_id on public.course_materials(teacher_id);
create index if not exists idx_course_announcements_course_id on public.course_announcements(course_id);
create index if not exists idx_course_announcements_teacher_id on public.course_announcements(teacher_id);
create index if not exists idx_course_assignments_course_id on public.course_assignments(course_id);
create index if not exists idx_course_assignments_teacher_id on public.course_assignments(teacher_id);
create index if not exists idx_assignment_submissions_assignment_id on public.assignment_submissions(assignment_id);
create index if not exists idx_assignment_submissions_student_id on public.assignment_submissions(student_id);

