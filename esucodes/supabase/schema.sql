-- =====================================================
-- ESUcodes Supabase Schema
-- Bu dosya, prod DB'ye 2026-06-21'de canlı bağlanılarak (information_schema +
-- pg_policies + pg_proc + pg_views üzerinden) doğrulanmış GERÇEK şemayı yansıtır.
-- Daha önceki sürüm stale'di: comments'in author_name/author_email/is_approved
-- kolonları, team_members/projects tabloları ve birkaç RLS policy'si hiç yoktu.
-- =====================================================

-- Profiles (auth.users'ı extend eder)
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  role        text not null default 'member' check (role in ('member', 'editor', 'admin')),
  username    text unique,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Yeni kullanıcı kaydolunca otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Posts
create table public.posts (
  id           uuid default gen_random_uuid() primary key,
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text not null default '',   -- Tiptap HTML
  category     text not null default 'Genel',
  author_id    uuid references public.profiles(id) on delete set null,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  read_time    text,
  cover_image  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- updated_at otomatik güncellensin
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure public.update_updated_at();

-- Comments — anonim model: giriş gerekmez, isim/email formla alınır, moderasyon
-- is_approved ile yapılır. author_id kolonu duruyor ama nullable ve şu an kullanılmıyor.
create table public.comments (
  id            uuid default gen_random_uuid() primary key,
  post_id       uuid references public.posts(id) on delete cascade not null,
  author_id     uuid references public.profiles(id) on delete cascade,
  content       text not null,
  created_at    timestamptz default now(),
  author_name   text,
  author_email  text,
  is_approved   boolean default false
);

-- Team members (admin panelinden yönetiliyor, herkese açık okunuyor)
create table public.team_members (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  role_title   text not null,
  bio          text,
  skills       text[] default '{}',
  github_url   text,
  linkedin_url text,
  order_index  integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Projects (admin panelinden yönetiliyor, herkese açık okunuyor)
create table public.projects (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  tagline      text,
  description  text,
  tech         text[] default '{}',
  status       text default 'development',
  github_url   text,
  live_url     text,
  icon         text default 'Globe',
  accent_color text default '#818cf8',
  order_index  integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Subscriptions
create table public.subscriptions (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references public.profiles(id) on delete set null,
  email            text not null unique,
  notify_blog      boolean default true,
  notify_projects  boolean default true,
  created_at       timestamptz default now()
);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

alter table public.profiles      enable row level security;
alter table public.posts         enable row level security;
alter table public.comments      enable row level security;
alter table public.team_members  enable row level security;
alter table public.projects      enable row level security;
alter table public.subscriptions enable row level security;

-- PROFILES
create policy "Herkes profil okuyabilir"
  on profiles for select using (true);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on profiles for update using (auth.uid() = id);

-- NOT: Admin'in BAŞKA bir kullanıcının role'ünü güncelleyebileceği bir RLS policy'si
-- yok. /api/admin/users/[id] bu yüzden bilinçli olarak service-role client kullanıyor
-- (app-layer requireRole('admin') + self-demotion guard'ından SONRA, sadece o satır için).

-- POSTS — okuma
create policy "Yayınlanmış postlar herkese açık"
  on posts for select using (status = 'published');

create policy "Editor/Admin taslakları görebilir"
  on posts for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

-- POSTS — yazma
create policy "Editor kendi postunu oluşturabilir"
  on posts for insert with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('editor', 'admin')
    )
    and author_id = auth.uid()
  );

create policy "Editor kendi postunu güncelleyebilir"
  on posts for update using (
    author_id = auth.uid()
    or exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Sadece admin silebilir"
  on posts for delete using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- COMMENTS
create policy "Onaylı yorumlar herkese açık"
  on comments for select using (is_approved = true);

create policy "Admin tüm yorumları görebilir"
  on comments for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Herkes yorum yapabilir"
  on comments for insert with check (true);
  -- BİLİNEN AÇIK: with_check kısıtlamasız olduğu için anon key ile PostgREST'e
  -- doğrudan istek atan biri is_approved=true gönderip moderasyonu atlayabilir.
  -- Uygulama her zaman is_approved:false ile insert ediyor ama RLS bunu ZORLAMIYOR.
  -- Önerilen düzeltme (henüz UYGULANMADI, onay bekliyor):
  --   drop policy "Herkes yorum yapabilir" on comments;
  --   create policy "Herkes yorum yapabilir"
  --     on comments for insert with check (is_approved = false);

create policy "Admin yorum yönetebilir"
  on comments for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- TEAM_MEMBERS
create policy "Ekip herkes okuyabilir"
  on team_members for select using (true);

create policy "Sadece admin ekip yönetebilir"
  on team_members for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- PROJECTS
create policy "Projeler herkes okuyabilir"
  on projects for select using (true);

create policy "Sadece admin proje yönetebilir"
  on projects for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- SUBSCRIPTIONS
create policy "Kullanıcı kendi aboneliğini yönetebilir"
  on subscriptions for all using (
    user_id = auth.uid() or user_id is null
  );

-- =====================================================
-- Admin için helper view (Dashboard metrikleri)
-- =====================================================
create or replace view public.admin_stats as
select
  (select count(*) from posts where status = 'published') as published_posts,
  (select count(*) from posts where status = 'draft')     as draft_posts,
  (select count(*) from profiles)                          as total_users,
  (select count(*) from comments)                          as total_comments;
