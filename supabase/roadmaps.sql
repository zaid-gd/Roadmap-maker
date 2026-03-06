create table if not exists public.roadmaps (
    id text primary key,
    roadmap jsonb not null,
    updated_at timestamptz not null default now()
);

alter table public.roadmaps enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'roadmaps'
          and policyname = 'Public read roadmaps'
    ) then
        create policy "Public read roadmaps"
            on public.roadmaps
            for select
            using (true);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'roadmaps'
          and policyname = 'Public write roadmaps'
    ) then
        create policy "Public write roadmaps"
            on public.roadmaps
            for insert
            with check (true);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'roadmaps'
          and policyname = 'Public update roadmaps'
    ) then
        create policy "Public update roadmaps"
            on public.roadmaps
            for update
            using (true)
            with check (true);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'roadmaps'
          and policyname = 'Public delete roadmaps'
    ) then
        create policy "Public delete roadmaps"
            on public.roadmaps
            for delete
            using (true);
    end if;
end $$;
