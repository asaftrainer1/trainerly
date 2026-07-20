-- ============================================================================
-- Trainerly — Database Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh
-- project. Designed for Postgres + Supabase Auth + Row Level Security.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type client_status as enum ('active', 'pending', 'inactive');
create type program_status as enum ('draft', 'active', 'completed', 'archived');
create type payment_status as enum ('paid', 'pending', 'overdue', 'refunded');
create type session_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');

-- ----------------------------------------------------------------------------
-- profiles — one row per trainer (extends auth.users)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  business_name text,
  avatar_url text,
  phone text,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- clients
-- ----------------------------------------------------------------------------
create table clients (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  avatar_url text,
  date_of_birth date,
  goal text,
  status client_status not null default 'active',
  starting_weight_kg numeric(5, 2),
  current_weight_kg numeric(5, 2),
  height_cm numeric(5, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_trainer_id_idx on clients(trainer_id);
create index clients_status_idx on clients(status);

-- ----------------------------------------------------------------------------
-- programs — a training program, optionally assigned to one client
-- (null client_id == reusable template)
-- ----------------------------------------------------------------------------
create table programs (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  description text,
  duration_weeks integer not null default 4,
  status program_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index programs_trainer_id_idx on programs(trainer_id);
create index programs_client_id_idx on programs(client_id);

-- ----------------------------------------------------------------------------
-- workouts — a single training day within a program
-- ----------------------------------------------------------------------------
create table workouts (
  id uuid primary key default uuid_generate_v4(),
  program_id uuid not null references programs(id) on delete cascade,
  name text not null,
  day_index integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index workouts_program_id_idx on workouts(program_id);

-- ----------------------------------------------------------------------------
-- exercises — individual movements within a workout day
-- ----------------------------------------------------------------------------
create table exercises (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid not null references workouts(id) on delete cascade,
  name text not null,
  sets integer not null default 3,
  reps text not null default '8-12',
  weight_kg numeric(6, 2),
  rest_seconds integer default 90,
  order_index integer not null default 0,
  notes text
);

create index exercises_workout_id_idx on exercises(workout_id);

-- ----------------------------------------------------------------------------
-- progress_entries — periodic body measurements per client
-- ----------------------------------------------------------------------------
create table progress_entries (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  trainer_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  weight_kg numeric(5, 2),
  body_fat_pct numeric(4, 1),
  chest_cm numeric(5, 2),
  waist_cm numeric(5, 2),
  hips_cm numeric(5, 2),
  arm_cm numeric(5, 2),
  thigh_cm numeric(5, 2),
  notes text,
  photo_url text,
  created_at timestamptz not null default now()
);

create index progress_entries_client_id_idx on progress_entries(client_id);
create index progress_entries_date_idx on progress_entries(date);

-- ----------------------------------------------------------------------------
-- payments — invoices/payments tracked per client
-- ----------------------------------------------------------------------------
create table payments (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  amount numeric(10, 2) not null,
  currency text not null default 'USD',
  status payment_status not null default 'pending',
  due_date date not null,
  paid_date date,
  method text,
  description text,
  invoice_number text not null default concat('INV-', to_char(now(), 'YYYYMMDD-HH24MISS')),
  created_at timestamptz not null default now()
);

create index payments_trainer_id_idx on payments(trainer_id);
create index payments_client_id_idx on payments(client_id);
create index payments_status_idx on payments(status);

-- ----------------------------------------------------------------------------
-- sessions — scheduled training sessions (dashboard "upcoming" widget)
-- ----------------------------------------------------------------------------
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  status session_status not null default 'scheduled',
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create index sessions_trainer_id_idx on sessions(trainer_id);
create index sessions_scheduled_at_idx on sessions(scheduled_at);

-- ============================================================================
-- updated_at auto-touch trigger
-- ============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_clients_updated_at before update on clients
  for each row execute function set_updated_at();
create trigger trg_programs_updated_at before update on programs
  for each row execute function set_updated_at();

-- ============================================================================
-- Auto-create a profile row whenever a new auth user signs up
-- ============================================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- Row Level Security — every trainer only ever sees their own data
-- ============================================================================
alter table profiles enable row level security;
alter table clients enable row level security;
alter table programs enable row level security;
alter table workouts enable row level security;
alter table exercises enable row level security;
alter table progress_entries enable row level security;
alter table payments enable row level security;
alter table sessions enable row level security;

-- profiles: a trainer can read/update only their own profile row
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- clients: full CRUD scoped to trainer_id
create policy "clients_select_own" on clients
  for select using (auth.uid() = trainer_id);
create policy "clients_insert_own" on clients
  for insert with check (auth.uid() = trainer_id);
create policy "clients_update_own" on clients
  for update using (auth.uid() = trainer_id);
create policy "clients_delete_own" on clients
  for delete using (auth.uid() = trainer_id);

-- programs
create policy "programs_select_own" on programs
  for select using (auth.uid() = trainer_id);
create policy "programs_insert_own" on programs
  for insert with check (auth.uid() = trainer_id);
create policy "programs_update_own" on programs
  for update using (auth.uid() = trainer_id);
create policy "programs_delete_own" on programs
  for delete using (auth.uid() = trainer_id);

-- workouts: scoped via parent program's trainer_id
create policy "workouts_select_own" on workouts
  for select using (
    exists (select 1 from programs p where p.id = workouts.program_id and p.trainer_id = auth.uid())
  );
create policy "workouts_insert_own" on workouts
  for insert with check (
    exists (select 1 from programs p where p.id = workouts.program_id and p.trainer_id = auth.uid())
  );
create policy "workouts_update_own" on workouts
  for update using (
    exists (select 1 from programs p where p.id = workouts.program_id and p.trainer_id = auth.uid())
  );
create policy "workouts_delete_own" on workouts
  for delete using (
    exists (select 1 from programs p where p.id = workouts.program_id and p.trainer_id = auth.uid())
  );

-- exercises: scoped via parent workout -> program's trainer_id
create policy "exercises_select_own" on exercises
  for select using (
    exists (
      select 1 from workouts w
      join programs p on p.id = w.program_id
      where w.id = exercises.workout_id and p.trainer_id = auth.uid()
    )
  );
create policy "exercises_insert_own" on exercises
  for insert with check (
    exists (
      select 1 from workouts w
      join programs p on p.id = w.program_id
      where w.id = exercises.workout_id and p.trainer_id = auth.uid()
    )
  );
create policy "exercises_update_own" on exercises
  for update using (
    exists (
      select 1 from workouts w
      join programs p on p.id = w.program_id
      where w.id = exercises.workout_id and p.trainer_id = auth.uid()
    )
  );
create policy "exercises_delete_own" on exercises
  for delete using (
    exists (
      select 1 from workouts w
      join programs p on p.id = w.program_id
      where w.id = exercises.workout_id and p.trainer_id = auth.uid()
    )
  );

-- progress_entries
create policy "progress_select_own" on progress_entries
  for select using (auth.uid() = trainer_id);
create policy "progress_insert_own" on progress_entries
  for insert with check (auth.uid() = trainer_id);
create policy "progress_update_own" on progress_entries
  for update using (auth.uid() = trainer_id);
create policy "progress_delete_own" on progress_entries
  for delete using (auth.uid() = trainer_id);

-- payments
create policy "payments_select_own" on payments
  for select using (auth.uid() = trainer_id);
create policy "payments_insert_own" on payments
  for insert with check (auth.uid() = trainer_id);
create policy "payments_update_own" on payments
  for update using (auth.uid() = trainer_id);
create policy "payments_delete_own" on payments
  for delete using (auth.uid() = trainer_id);

-- sessions
create policy "sessions_select_own" on sessions
  for select using (auth.uid() = trainer_id);
create policy "sessions_insert_own" on sessions
  for insert with check (auth.uid() = trainer_id);
create policy "sessions_update_own" on sessions
  for update using (auth.uid() = trainer_id);
create policy "sessions_delete_own" on sessions
  for delete using (auth.uid() = trainer_id);

-- ============================================================================
-- Storage buckets (avatars + progress photos)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatar_owner_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "progress_photo_owner_read" on storage.objects
  for select using (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "progress_photo_owner_write" on storage.objects
  for insert with check (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);
