create extension if not exists pgcrypto;

create table if not exists public.roadmaps (
    id text primary key,
    user_id uuid references auth.users (id) on delete cascade,
    roadmap jsonb not null,
    updated_at timestamptz not null default now()
);

alter table public.roadmaps
    add column if not exists user_id uuid references auth.users (id) on delete cascade;

create table if not exists public.subscriptions (
    user_id uuid primary key references auth.users (id) on delete cascade,
    stripe_customer_id text unique,
    stripe_subscription_id text unique,
    stripe_price_id text,
    plan_id text default 'free',
    billing_interval text,
    status text,
    current_period_start timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint subscriptions_billing_interval_check
        check (billing_interval in ('monthly', 'annual') or billing_interval is null)
);

create table if not exists public.ai_generation_events (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
);

create index if not exists ai_generation_events_user_id_created_at_idx
    on public.ai_generation_events (user_id, created_at desc);

create index if not exists roadmaps_user_id_updated_at_idx
    on public.roadmaps (user_id, updated_at desc);

create table if not exists public.notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    title text not null default '',
    content text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists notes_user_id_updated_at_idx
    on public.notes (user_id, updated_at desc);

alter table public.roadmaps enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ai_generation_events enable row level security;
alter table public.notes enable row level security;

drop policy if exists "Public read roadmaps" on public.roadmaps;
drop policy if exists "Public write roadmaps" on public.roadmaps;
drop policy if exists "Public update roadmaps" on public.roadmaps;
drop policy if exists "Public delete roadmaps" on public.roadmaps;
drop policy if exists "Users can read own roadmaps" on public.roadmaps;
drop policy if exists "Users can insert own roadmaps" on public.roadmaps;
drop policy if exists "Users can update own roadmaps" on public.roadmaps;
drop policy if exists "Users can delete own roadmaps" on public.roadmaps;

create policy "Users can read own roadmaps"
    on public.roadmaps
    for select
    using (auth.uid() = user_id);

create policy "Users can insert own roadmaps"
    on public.roadmaps
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update own roadmaps"
    on public.roadmaps
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own roadmaps"
    on public.roadmaps
    for delete
    using (auth.uid() = user_id);

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'subscriptions'
          and policyname = 'Users can read own subscription'
    ) then
        create policy "Users can read own subscription"
            on public.subscriptions
            for select
            using (auth.uid() = user_id);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'ai_generation_events'
          and policyname = 'Users can read own AI generation events'
    ) then
        create policy "Users can read own AI generation events"
            on public.ai_generation_events
            for select
            using (auth.uid() = user_id);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'ai_generation_events'
          and policyname = 'Users can insert own AI generation events'
    ) then
        create policy "Users can insert own AI generation events"
            on public.ai_generation_events
            for insert
            with check (auth.uid() = user_id);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'notes'
          and policyname = 'Users can read own notes'
    ) then
        create policy "Users can read own notes"
            on public.notes
            for select
            using (auth.uid() = user_id);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'notes'
          and policyname = 'Users can insert own notes'
    ) then
        create policy "Users can insert own notes"
            on public.notes
            for insert
            with check (auth.uid() = user_id);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'notes'
          and policyname = 'Users can update own notes'
    ) then
        create policy "Users can update own notes"
            on public.notes
            for update
            using (auth.uid() = user_id)
            with check (auth.uid() = user_id);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'notes'
          and policyname = 'Users can delete own notes'
    ) then
        create policy "Users can delete own notes"
            on public.notes
            for delete
            using (auth.uid() = user_id);
    end if;
end $$;
