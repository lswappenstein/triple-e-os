-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  organization_id uuid,
  role text check (role in ('admin', 'member')) default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create organizations table
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create health check templates
create table public.health_check_templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create health check questions
create table public.health_check_questions (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references public.health_check_templates on delete cascade not null,
  question text not null,
  dimension text not null,
  order_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create health check assessments
create table public.health_check_assessments (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  template_id uuid references public.health_check_templates on delete cascade not null,
  status text check (status in ('draft', 'completed')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Create health check responses
create table public.health_check_responses (
  id uuid default uuid_generate_v4() primary key,
  assessment_id uuid references public.health_check_assessments on delete cascade not null,
  question_id uuid references public.health_check_questions on delete cascade not null,
  response integer check (response between 1 and 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create system archetypes
create table public.system_archetypes (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  name text not null,
  description text,
  selected boolean default false,
  intensity integer check (intensity between 1 and 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create quick wins
create table public.quick_wins (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  title text not null,
  description text,
  status text check (status in ('todo', 'in_progress', 'done')) default 'todo',
  source text check (status in ('health_check', 'archetype', 'manual')),
  source_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create strategy map nodes
create table public.strategy_map_nodes (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  title text not null,
  content text,
  type text check (type in ('hypothesis', 'decision', 'experiment')),
  position_x integer,
  position_y integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create strategy map edges
create table public.strategy_map_edges (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  from_node_id uuid references public.strategy_map_nodes on delete cascade not null,
  to_node_id uuid references public.strategy_map_nodes on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create decisions
create table public.decisions (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  title text not null,
  description text,
  assumptions text[],
  validation_status text check (validation_status in ('pending', 'validated', 'invalidated')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reviews
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  changes text,
  learnings text,
  adjustments text,
  review_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.health_check_templates enable row level security;
alter table public.health_check_questions enable row level security;
alter table public.health_check_assessments enable row level security;
alter table public.health_check_responses enable row level security;
alter table public.system_archetypes enable row level security;
alter table public.quick_wins enable row level security;
alter table public.strategy_map_nodes enable row level security;
alter table public.strategy_map_edges enable row level security;
alter table public.decisions enable row level security;
alter table public.reviews enable row level security;

-- Create policies
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can read their organization's data"
  on public.organizations for select
  using (id in (
    select organization_id from public.profiles
    where id = auth.uid()
  ));

-- Add more policies for other tables following the same pattern

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 