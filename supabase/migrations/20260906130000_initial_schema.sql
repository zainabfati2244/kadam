create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, avatar_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, body text, type text, data jsonb not null default '{}'::jsonb, is_read boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  token text not null, platform text not null, device_info jsonb not null default '{}'::jsonb, enabled boolean not null default true, created_at timestamptz not null default now(), unique(user_id, token)
);
alter table public.profiles enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "mark own notifications" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own device tokens" on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles (id, full_name, avatar_url) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'avatar_url'); return new; end; $$;
create or replace trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
alter publication supabase_realtime add table public.notifications;
