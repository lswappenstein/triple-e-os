-- Drop existing objects
DO $$ 
BEGIN
    -- Drop triggers if they exist
    DROP TRIGGER IF EXISTS update_decision_reviews_updated_at ON public.decision_reviews;
    DROP TRIGGER IF EXISTS update_decisions_updated_at ON public.decisions;
    DROP TRIGGER IF EXISTS update_strategy_map_nodes_updated_at ON public.strategy_map_nodes;
    DROP TRIGGER IF EXISTS update_quick_wins_updated_at ON public.quick_wins;
    DROP TRIGGER IF EXISTS update_system_archetypes_updated_at ON public.system_archetypes;
    DROP TRIGGER IF EXISTS update_health_check_responses_updated_at ON public.health_check_responses;
    DROP TRIGGER IF EXISTS update_health_check_assessments_updated_at ON public.health_check_assessments;
    DROP TRIGGER IF EXISTS update_health_check_questions_updated_at ON public.health_check_questions;
    DROP TRIGGER IF EXISTS update_health_check_templates_updated_at ON public.health_check_templates;
    DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Drop function if it exists (with CASCADE to handle dependent triggers)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables if they exist
DROP TABLE IF EXISTS 
    public.decision_reviews,
    public.decisions,
    public.strategy_map_nodes,
    public.quick_wins,
    public.system_archetypes,
    public.health_check_responses,
    public.health_check_assessments,
    public.health_check_questions,
    public.health_check_templates,
    public.profiles,
    public.organizations
CASCADE;

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    organization_id uuid,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create organizations table
create table public.organizations (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Add foreign key constraint to profiles
alter table public.profiles
add constraint fk_organization
foreign key (organization_id)
references public.organizations(id)
on delete set null;

-- Create health check templates table
create table public.health_check_templates (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    organization_id uuid references public.organizations(id) on delete cascade,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create health check questions table
create table public.health_check_questions (
    id uuid default uuid_generate_v4() primary key,
    template_id uuid references public.health_check_templates(id) on delete cascade,
    question text not null,
    description text,
    order_index integer not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create health check assessments table
create table public.health_check_assessments (
    id uuid default uuid_generate_v4() primary key,
    template_id uuid references public.health_check_templates(id) on delete cascade,
    organization_id uuid references public.organizations(id) on delete cascade,
    created_by uuid references public.profiles(id) on delete set null,
    status text not null default 'draft',
    started_at timestamptz default now(),
    completed_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create health check responses table
create table public.health_check_responses (
    id uuid default uuid_generate_v4() primary key,
    assessment_id uuid references public.health_check_assessments(id) on delete cascade,
    question_id uuid references public.health_check_questions(id) on delete cascade,
    response_value integer not null,
    comment text,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create system archetypes table
create table public.system_archetypes (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    organization_id uuid references public.organizations(id) on delete cascade,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create quick wins table
create table public.quick_wins (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    status text not null default 'pending',
    organization_id uuid references public.organizations(id) on delete cascade,
    created_by uuid references public.profiles(id) on delete set null,
    assigned_to uuid references public.profiles(id) on delete set null,
    due_date date,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create strategy map nodes table
create table public.strategy_map_nodes (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    perspective text not null,
    organization_id uuid references public.organizations(id) on delete cascade,
    parent_id uuid references public.strategy_map_nodes(id) on delete set null,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create decisions table
create table public.decisions (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    status text not null default 'pending',
    organization_id uuid references public.organizations(id) on delete cascade,
    created_by uuid references public.profiles(id) on delete set null,
    decided_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create decision reviews table
create table public.decision_reviews (
    id uuid default uuid_generate_v4() primary key,
    decision_id uuid references public.decisions(id) on delete cascade,
    review_text text not null,
    effectiveness_rating integer,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.health_check_templates enable row level security;
alter table public.health_check_questions enable row level security;
alter table public.health_check_assessments enable row level security;
alter table public.health_check_responses enable row level security;
alter table public.system_archetypes enable row level security;
alter table public.quick_wins enable row level security;
alter table public.strategy_map_nodes enable row level security;
alter table public.decisions enable row level security;
alter table public.decision_reviews enable row level security;

-- Create RLS policies
-- Profiles: Users can read all profiles in their organization, but only update their own
create policy "Users can view profiles in their organization"
    on public.profiles for select
    using (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

create policy "Users can update their own profile"
    on public.profiles for update
    using (id = auth.uid());

-- Organizations: Users can read their organization
create policy "Users can view their organization"
    on public.organizations for select
    using (id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

-- Health Check Templates: Users can read all templates in their organization
create policy "Users can view health check templates in their organization"
    on public.health_check_templates for select
    using (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

-- Health Check Questions: Users can read questions for templates in their organization
create policy "Users can view health check questions in their organization"
    on public.health_check_questions for select
    using (template_id in (
        select id from public.health_check_templates
        where organization_id in (
            select organization_id from public.profiles where id = auth.uid()
        )
    ));

-- Health Check Assessments: Users can read and create assessments in their organization
create policy "Users can view health check assessments in their organization"
    on public.health_check_assessments for select
    using (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

create policy "Users can create health check assessments in their organization"
    on public.health_check_assessments for insert
    with check (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

-- Health Check Responses: Users can read and create responses for assessments in their organization
create policy "Users can view health check responses in their organization"
    on public.health_check_responses for select
    using (assessment_id in (
        select id from public.health_check_assessments
        where organization_id in (
            select organization_id from public.profiles where id = auth.uid()
        )
    ));

create policy "Users can create health check responses in their organization"
    on public.health_check_responses for insert
    with check (assessment_id in (
        select id from public.health_check_assessments
        where organization_id in (
            select organization_id from public.profiles where id = auth.uid()
        )
    ));

-- System Archetypes: Users can read and create archetypes in their organization
create policy "Users can view system archetypes in their organization"
    on public.system_archetypes for select
    using (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

create policy "Users can create system archetypes in their organization"
    on public.system_archetypes for insert
    with check (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

-- Quick Wins: Users can read and create quick wins in their organization
create policy "Users can view quick wins in their organization"
    on public.quick_wins for select
    using (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

create policy "Users can create quick wins in their organization"
    on public.quick_wins for insert
    with check (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

-- Strategy Map Nodes: Users can read and create nodes in their organization
create policy "Users can view strategy map nodes in their organization"
    on public.strategy_map_nodes for select
    using (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

create policy "Users can create strategy map nodes in their organization"
    on public.strategy_map_nodes for insert
    with check (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

-- Decisions: Users can read and create decisions in their organization
create policy "Users can view decisions in their organization"
    on public.decisions for select
    using (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

create policy "Users can create decisions in their organization"
    on public.decisions for insert
    with check (organization_id in (
        select organization_id from public.profiles where id = auth.uid()
    ));

-- Decision Reviews: Users can read and create reviews for decisions in their organization
create policy "Users can view decision reviews in their organization"
    on public.decision_reviews for select
    using (decision_id in (
        select id from public.decisions
        where organization_id in (
            select organization_id from public.profiles where id = auth.uid()
        )
    ));

create policy "Users can create decision reviews in their organization"
    on public.decision_reviews for insert
    with check (decision_id in (
        select id from public.decisions
        where organization_id in (
            select organization_id from public.profiles where id = auth.uid()
        )
    ));

-- Create indexes for better performance
create index idx_profiles_organization on public.profiles(organization_id);
create index idx_health_check_templates_organization on public.health_check_templates(organization_id);
create index idx_health_check_questions_template on public.health_check_questions(template_id);
create index idx_health_check_assessments_organization on public.health_check_assessments(organization_id);
create index idx_health_check_responses_assessment on public.health_check_responses(assessment_id);
create index idx_system_archetypes_organization on public.system_archetypes(organization_id);
create index idx_quick_wins_organization on public.quick_wins(organization_id);
create index idx_strategy_map_nodes_organization on public.strategy_map_nodes(organization_id);
create index idx_decisions_organization on public.decisions(organization_id);
create index idx_decision_reviews_decision on public.decision_reviews(decision_id);

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
    before update on public.profiles
    for each row
    execute function update_updated_at_column();

create trigger update_organizations_updated_at
    before update on public.organizations
    for each row
    execute function update_updated_at_column();

create trigger update_health_check_templates_updated_at
    before update on public.health_check_templates
    for each row
    execute function update_updated_at_column();

create trigger update_health_check_questions_updated_at
    before update on public.health_check_questions
    for each row
    execute function update_updated_at_column();

create trigger update_health_check_assessments_updated_at
    before update on public.health_check_assessments
    for each row
    execute function update_updated_at_column();

create trigger update_health_check_responses_updated_at
    before update on public.health_check_responses
    for each row
    execute function update_updated_at_column();

create trigger update_system_archetypes_updated_at
    before update on public.system_archetypes
    for each row
    execute function update_updated_at_column();

create trigger update_quick_wins_updated_at
    before update on public.quick_wins
    for each row
    execute function update_updated_at_column();

create trigger update_strategy_map_nodes_updated_at
    before update on public.strategy_map_nodes
    for each row
    execute function update_updated_at_column();

create trigger update_decisions_updated_at
    before update on public.decisions
    for each row
    execute function update_updated_at_column();

create trigger update_decision_reviews_updated_at
    before update on public.decision_reviews
    for each row
    execute function update_updated_at_column(); 