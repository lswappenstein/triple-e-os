-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type assessment_status as enum ('draft', 'submitted', 'reviewed');
create type archetype_category as enum ('behavioral', 'structural', 'transformational');
create type decision_status as enum ('pending', 'approved', 'rejected', 'implemented');
create type review_type as enum ('weekly', 'monthly', 'quarterly', 'annual');

-- Create profiles table (extends Supabase auth.users)
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    avatar_url text,
    organization_id uuid,
    role text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create organizations table
create table organizations (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    logo_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Add foreign key to profiles
alter table profiles
add constraint fk_organization
foreign key (organization_id)
references organizations(id)
on delete set null;

-- Create health_check_templates table
create table health_check_templates (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create health_check_questions table
create table health_check_questions (
    id uuid default uuid_generate_v4() primary key,
    template_id uuid references health_check_templates(id) on delete cascade,
    question text not null,
    category text not null,
    weight integer default 1,
    order_index integer not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create health_check_assessments table
create table health_check_assessments (
    id uuid default uuid_generate_v4() primary key,
    template_id uuid references health_check_templates(id) on delete cascade,
    organization_id uuid references organizations(id) on delete cascade,
    assessor_id uuid references profiles(id) on delete cascade,
    status assessment_status default 'draft',
    submitted_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create health_check_responses table
create table health_check_responses (
    id uuid default uuid_generate_v4() primary key,
    assessment_id uuid references health_check_assessments(id) on delete cascade,
    question_id uuid references health_check_questions(id) on delete cascade,
    score integer not null check (score >= 1 and score <= 5),
    comment text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create system_archetypes table
create table system_archetypes (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    name text not null,
    description text,
    category archetype_category not null,
    identified_by uuid references profiles(id),
    identified_at timestamptz default now(),
    status text default 'active',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create quick_wins table
create table quick_wins (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    title text not null,
    description text,
    impact_score integer check (impact_score >= 1 and impact_score <= 5),
    effort_score integer check (effort_score >= 1 and effort_score <= 5),
    status text default 'pending',
    assigned_to uuid references profiles(id),
    due_date timestamptz,
    completed_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create strategy_map_nodes table
create table strategy_map_nodes (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    title text not null,
    description text,
    perspective text not null,
    parent_id uuid references strategy_map_nodes(id),
    order_index integer not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create decisions table
create table decisions (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    title text not null,
    description text,
    status decision_status default 'pending',
    decided_by uuid references profiles(id),
    decided_at timestamptz,
    implementation_date timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create reviews table
create table reviews (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    type review_type not null,
    start_date timestamptz not null,
    end_date timestamptz not null,
    summary text,
    conducted_by uuid references profiles(id),
    status text default 'scheduled',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create review_items table
create table review_items (
    id uuid default uuid_generate_v4() primary key,
    review_id uuid references reviews(id) on delete cascade,
    item_type text not null,
    item_id uuid not null,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table health_check_templates enable row level security;
alter table health_check_questions enable row level security;
alter table health_check_assessments enable row level security;
alter table health_check_responses enable row level security;
alter table system_archetypes enable row level security;
alter table quick_wins enable row level security;
alter table strategy_map_nodes enable row level security;
alter table decisions enable row level security;
alter table reviews enable row level security;
alter table review_items enable row level security;

-- Create policies
create policy "Users can view their own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on profiles for update
    using (auth.uid() = id);

create policy "Users can view their organization"
    on organizations for select
    using (id in (
        select organization_id from profiles where id = auth.uid()
    ));

create policy "Users can create organizations"
    on organizations for insert
    with check (true);  -- Allow any authenticated user to create an organization

-- Create indexes for better query performance
create index idx_profiles_organization on profiles(organization_id);
create index idx_health_check_templates_organization on health_check_templates(organization_id);
create index idx_health_check_assessments_organization on health_check_assessments(organization_id);
create index idx_system_archetypes_organization on system_archetypes(organization_id);
create index idx_quick_wins_organization on quick_wins(organization_id);
create index idx_strategy_map_nodes_organization on strategy_map_nodes(organization_id);
create index idx_decisions_organization on decisions(organization_id);
create index idx_reviews_organization on reviews(organization_id);

-- Create functions for automatic timestamp updates
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for automatic timestamp updates
create trigger update_profiles_updated_at
    before update on profiles
    for each row
    execute function update_updated_at_column();

create trigger update_organizations_updated_at
    before update on organizations
    for each row
    execute function update_updated_at_column();

create trigger update_health_check_templates_updated_at
    before update on health_check_templates
    for each row
    execute function update_updated_at_column();

create trigger update_health_check_questions_updated_at
    before update on health_check_questions
    for each row
    execute function update_updated_at_column();

create trigger update_health_check_assessments_updated_at
    before update on health_check_assessments
    for each row
    execute function update_updated_at_column();

create trigger update_health_check_responses_updated_at
    before update on health_check_responses
    for each row
    execute function update_updated_at_column();

create trigger update_system_archetypes_updated_at
    before update on system_archetypes
    for each row
    execute function update_updated_at_column();

create trigger update_quick_wins_updated_at
    before update on quick_wins
    for each row
    execute function update_updated_at_column();

create trigger update_strategy_map_nodes_updated_at
    before update on strategy_map_nodes
    for each row
    execute function update_updated_at_column();

create trigger update_decisions_updated_at
    before update on decisions
    for each row
    execute function update_updated_at_column();

create trigger update_reviews_updated_at
    before update on reviews
    for each row
    execute function update_updated_at_column();

create trigger update_review_items_updated_at
    before update on review_items
    for each row
    execute function update_updated_at_column(); 