-- NutriSnap Users Table
-- Run this in Supabase SQL Editor (Database > SQL Editor)

-- Create the users table
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  age integer,
  height numeric, -- cm
  weight numeric, -- kg
  sex text check (sex in ('male', 'female', 'other')),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal text check (goal in ('lose', 'maintain', 'gain')),
  target_weight numeric,
  daily_calorie_target integer,
  daily_protein_target numeric,
  daily_carbs_target numeric,
  daily_fat_target numeric,
  current_streak integer default 0,
  total_logs integer default 0,
  onboarding_completed boolean default false,
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table users enable row level security;

-- RLS Policies
create policy "Users can view own data"
  on users for select using (auth.uid() = id);

create policy "Users can insert own data"
  on users for insert with check (auth.uid() = id);

create policy "Users can update own data"
  on users for update using (auth.uid() = id);

-- Create index for faster queries
create index users_id_idx on users(id);
create index users_email_idx on users(email);
