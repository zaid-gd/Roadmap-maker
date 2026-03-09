alter table public.roadmaps
    add column if not exists title text,
    add column if not exists summary text,
    add column if not exists mode text,
    add column if not exists content_type text,
    add column if not exists is_public boolean not null default false,
    add column if not exists fork_count integer not null default 0,
    add column if not exists forked_from text;

create index if not exists roadmaps_is_public_updated_at_idx
    on public.roadmaps (is_public, updated_at desc);

create table if not exists public.srs_items (
    id text primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    roadmap_id text not null references public.roadmaps (id) on delete cascade,
    section_id text,
    prompt text not null,
    answer text not null,
    ease_factor double precision not null default 2.5,
    interval_days integer not null default 0,
    repetitions integer not null default 0,
    due_at timestamptz not null,
    last_reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists srs_items_user_id_due_at_idx
    on public.srs_items (user_id, due_at asc);

create table if not exists public.credit_ledgers (
    user_id uuid primary key references auth.users (id) on delete cascade,
    plan_id text not null default 'free',
    allowance integer not null default 10,
    used integer not null default 0,
    reset_at timestamptz not null,
    updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    kind text not null,
    amount integer not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists credit_transactions_user_id_created_at_idx
    on public.credit_transactions (user_id, created_at desc);

create table if not exists public.progress_snapshots (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    roadmap_id text not null references public.roadmaps (id) on delete cascade,
    section_id text not null,
    completion_rate double precision not null,
    completed_tasks integer not null,
    total_tasks integer not null,
    created_at timestamptz not null default now()
);

create index if not exists progress_snapshots_user_id_roadmap_id_created_at_idx
    on public.progress_snapshots (user_id, roadmap_id, created_at desc);

create table if not exists public.coaching_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    roadmap_id text not null references public.roadmaps (id) on delete cascade,
    date timestamptz not null,
    duration_minutes integer not null default 0,
    topics jsonb not null default '[]'::jsonb,
    next_steps text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists coaching_sessions_user_id_roadmap_id_date_idx
    on public.coaching_sessions (user_id, roadmap_id, date desc);

create table if not exists public.user_privacy_settings (
    user_id uuid primary key references auth.users (id) on delete cascade,
    anonymous_analytics boolean not null default false,
    allow_public_gallery boolean not null default false,
    updated_at timestamptz not null default now()
);

alter table public.srs_items enable row level security;
alter table public.credit_ledgers enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.progress_snapshots enable row level security;
alter table public.coaching_sessions enable row level security;
alter table public.user_privacy_settings enable row level security;

drop policy if exists "Users can read own srs items" on public.srs_items;
drop policy if exists "Users can write own srs items" on public.srs_items;
create policy "Users can read own srs items"
    on public.srs_items
    for select
    using (auth.uid() = user_id);
create policy "Users can write own srs items"
    on public.srs_items
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Users can read own credit ledgers" on public.credit_ledgers;
drop policy if exists "Users can write own credit ledgers" on public.credit_ledgers;
create policy "Users can read own credit ledgers"
    on public.credit_ledgers
    for select
    using (auth.uid() = user_id);
create policy "Users can write own credit ledgers"
    on public.credit_ledgers
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Users can read own credit transactions" on public.credit_transactions;
drop policy if exists "Users can write own credit transactions" on public.credit_transactions;
create policy "Users can read own credit transactions"
    on public.credit_transactions
    for select
    using (auth.uid() = user_id);
create policy "Users can write own credit transactions"
    on public.credit_transactions
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Users can read own progress snapshots" on public.progress_snapshots;
drop policy if exists "Users can write own progress snapshots" on public.progress_snapshots;
create policy "Users can read own progress snapshots"
    on public.progress_snapshots
    for select
    using (auth.uid() = user_id);
create policy "Users can write own progress snapshots"
    on public.progress_snapshots
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Users can read own coaching sessions" on public.coaching_sessions;
drop policy if exists "Users can write own coaching sessions" on public.coaching_sessions;
create policy "Users can read own coaching sessions"
    on public.coaching_sessions
    for select
    using (auth.uid() = user_id);
create policy "Users can write own coaching sessions"
    on public.coaching_sessions
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Users can read own privacy settings" on public.user_privacy_settings;
drop policy if exists "Users can write own privacy settings" on public.user_privacy_settings;
create policy "Users can read own privacy settings"
    on public.user_privacy_settings
    for select
    using (auth.uid() = user_id);
create policy "Users can write own privacy settings"
    on public.user_privacy_settings
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
