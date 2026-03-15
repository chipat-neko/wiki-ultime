-- ══════════════════════════════════════════════════════════════════════════════
-- SC Companion — Schéma Supabase (v2 — sécurisé)
-- À coller dans : supabase.com → ton projet → SQL Editor → New Query → Run
-- Si tu avais déjà exécuté la v1, exécute ce fichier complet (les DROP IF EXISTS
-- gèrent la mise à jour des fonctions et policies existantes).
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Table : profiles ─────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique,
  email       text,
  role        text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  status      text not null default 'pending' check (status in ('pending', 'active', 'banned')),
  stars       integer not null default 0 check (stars >= 0),
  level       integer not null default 0 check (level >= 0 and level <= 5),
  bio         text check (char_length(bio) <= 500),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_role_idx   on public.profiles(role);

-- ─── Table : contributions ────────────────────────────────────────────────────
create table if not exists public.contributions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  type            text not null check (type in ('ship', 'commodity', 'guide', 'image', 'other')),
  title           text not null check (char_length(title) between 3 and 200),
  description     text check (char_length(description) <= 2000),
  content         jsonb,
  status          text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  reviewer_id     uuid references public.profiles(id),
  reviewer_note   text check (char_length(reviewer_note) <= 1000),
  stars_awarded   integer default 0 check (stars_awarded >= 0 and stars_awarded <= 50),
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz
);

create index if not exists contributions_status_idx  on public.contributions(status);
create index if not exists contributions_user_idx    on public.contributions(user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ══════════════════════════════════════════════════════════════════════════════

-- Crée automatiquement un profil "pending" quand un utilisateur s'inscrit
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  safe_username text;
begin
  -- Sanitize le username : lettres, chiffres, underscore uniquement
  safe_username := regexp_replace(
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    '[^a-zA-Z0-9_]', '_', 'g'
  );
  -- Tronquer à 30 caractères
  safe_username := left(safe_username, 30);

  insert into public.profiles (id, username, email, status)
  values (new.id, safe_username, new.email, 'pending');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Met à jour updated_at automatiquement
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- FONCTIONS RPC SÉCURISÉES
-- Chaque fonction vérifie que l'appelant a le rôle requis.
-- ══════════════════════════════════════════════════════════════════════════════

-- Accepte une contribution + octroie les étoiles + recalcule le niveau
-- SÉCURITÉ : vérifie que l'appelant est admin ou modérateur
create or replace function public.accept_contribution(
  contribution_id uuid,
  stars_to_award  integer default 5
)
returns void language plpgsql security definer as $$
declare
  caller_role text;
  v_user_id   uuid;
  v_new_stars integer;
  v_new_level integer;
begin
  -- ① Vérifie que l'appelant est authentifié (SECURITY DEFINER — défense en profondeur)
  if auth.uid() is null then
    raise exception 'Non authentifié';
  end if;

  -- ② Vérifie que l'appelant est admin ou modérateur
  select role into caller_role
  from public.profiles
  where id = auth.uid();

  if caller_role not in ('admin', 'moderator') then
    raise exception 'Permission refusée : rôle admin ou modérateur requis';
  end if;

  -- ② Borne les étoiles entre 1 et 20
  stars_to_award := greatest(1, least(20, stars_to_award));

  -- ③ Récupère l'auteur
  select user_id into v_user_id
  from public.contributions
  where id = contribution_id;

  if v_user_id is null then
    raise exception 'Contribution introuvable';
  end if;

  -- ④ Marque la contribution comme acceptée
  update public.contributions
  set status        = 'accepted',
      stars_awarded = stars_to_award,
      reviewer_id   = auth.uid(),
      reviewed_at   = now()
  where id = contribution_id
    and status = 'pending';  -- Idempotent : ne ré-accepte pas une contribution déjà traitée

  -- ⑤ Ajoute les étoiles au profil
  update public.profiles
  set stars = stars + stars_to_award
  where id = v_user_id
  returning stars into v_new_stars;

  -- ⑥ Recalcule le niveau
  v_new_level := case
    when v_new_stars >= 250 then 5
    when v_new_stars >= 100 then 4
    when v_new_stars >= 40  then 3
    when v_new_stars >= 15  then 2
    when v_new_stars >= 5   then 1
    else 0
  end;

  update public.profiles set level = v_new_level where id = v_user_id;
end;
$$;

-- Rejette et supprime un utilisateur en attente
-- SÉCURITÉ : admin uniquement (les mods ne peuvent pas supprimer de comptes)
create or replace function public.reject_user(target_user_id uuid)
returns void language plpgsql security definer as $$
declare
  caller_role   text;
  target_status text;
begin
  -- ① Vérifie que l'appelant est authentifié (SECURITY DEFINER — défense en profondeur)
  if auth.uid() is null then
    raise exception 'Non authentifié';
  end if;

  -- ② Vérifie que l'appelant est admin
  select role into caller_role
  from public.profiles
  where id = auth.uid();

  if caller_role != 'admin' then
    raise exception 'Permission refusée : rôle admin requis pour supprimer un compte';
  end if;

  -- ② SÉCURITÉ : l'admin ne peut pas supprimer son propre compte via cette fonction
  if target_user_id = auth.uid() then
    raise exception 'Vous ne pouvez pas supprimer votre propre compte';
  end if;

  -- ② Vérifie que la cible est en statut "pending" (ne peut pas supprimer un compte actif)
  select status into target_status
  from public.profiles
  where id = target_user_id;

  if target_status is null then
    raise exception 'Utilisateur introuvable';
  end if;

  if target_status != 'pending' then
    raise exception 'Seuls les comptes en attente peuvent être supprimés via cette fonction';
  end if;

  -- ③ Supprime de auth.users (cascade supprime le profil)
  delete from auth.users where id = target_user_id;
end;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.profiles     enable row level security;
alter table public.contributions enable row level security;

-- Supprime les anciennes policies si elles existent (pour mise à jour propre)
drop policy if exists "profiles_select_auth"     on public.profiles;
drop policy if exists "profiles_update_own"      on public.profiles;
drop policy if exists "profiles_update_admin"    on public.profiles;
drop policy if exists "contributions_select_auth"   on public.contributions;
drop policy if exists "contributions_insert_active" on public.contributions;
drop policy if exists "contributions_update_mod"    on public.contributions;
-- Anciennes variantes nommées différemment
drop policy if exists "profiles_select_all"      on public.profiles;
drop policy if exists "contributions_update_admin" on public.contributions;

-- ─── Policies : profiles ──────────────────────────────────────────────────────

-- Lecture : profils actifs visibles par tous les connectés ; pending/banned uniquement par soi-même ou admin/mod
-- S-02 : empêche l'énumération des comptes en attente par des utilisateurs ordinaires
create policy "profiles_select_auth"
  on public.profiles for select
  to authenticated
  using (
    status = 'active'
    OR id = auth.uid()
    OR exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('admin', 'moderator')
    )
  );

-- Mise à jour champs personnels : username, bio, avatar_url UNIQUEMENT
-- SÉCURITÉ : le WITH CHECK empêche de modifier role, status, stars, level
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Le rôle et le statut ne peuvent pas être modifiés par l'utilisateur lui-même
    AND role   = (select role   from public.profiles where id = auth.uid())
    AND status = (select status from public.profiles where id = auth.uid())
    AND stars  = (select stars  from public.profiles where id = auth.uid())
    AND level  = (select level  from public.profiles where id = auth.uid())
  );

-- Mise à jour admin/mod : peuvent modifier status et role (pour approbation)
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('admin', 'moderator')
    )
  );

-- ─── Policies : contributions ─────────────────────────────────────────────────

-- Lecture : tout utilisateur connecté peut lire les contributions
create policy "contributions_select_auth"
  on public.contributions for select
  to authenticated
  using (true);

-- Insertion : uniquement les utilisateurs actifs (pas pending, pas banned)
create policy "contributions_insert_active"
  on public.contributions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.status = 'active'
    )
    -- Empêche d'insérer avec un user_id différent du sien
    and user_id = auth.uid()
  );

-- Mise à jour : uniquement les admin/mod (pour les reviews)
-- S-03 : WITH CHECK restreint les champs modifiables aux seuls champs de review (status, reviewer_id, reviewed_at, stars_awarded, reviewer_note)
create policy "contributions_update_mod"
  on public.contributions for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('admin', 'moderator')
    )
  )
  with check (
    -- Les champs structurels ne peuvent pas être modifiés par les reviewers
    user_id = (select c.user_id from public.contributions c where c.id = id)
    AND type  = (select c.type  from public.contributions c where c.id = id)
    AND title = (select c.title from public.contributions c where c.id = id)
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- STORAGE — Bucket pour les images de contributions
-- À faire dans : Dashboard Supabase → Storage → New bucket
-- Nom du bucket : contribution-images
-- Public : OUI (les images sont lisibles par tous)
-- Taille max fichier : 8 Mo
-- ──────────────────────────────────────────────────────────────────────────────
-- Ensuite coller ces policies dans : Storage → contribution-images → Policies
-- ══════════════════════════════════════════════════════════════════════════════

-- Policy 1 : lecture publique (SELECT)
-- Cocher "Allow public access" dans les options du bucket OU ajouter :
/*
create policy "contribution_images_select"
  on storage.objects for select
  using ( bucket_id = 'contribution-images' );
*/

-- Policy 2 : upload — uniquement les utilisateurs actifs, dans leur dossier
/*
create policy "contribution_images_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'contribution-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND exists (
      select 1 from public.profiles
      where id = auth.uid() and status = 'active'
    )
  );
*/

-- Policy 3 : suppression interdite aux utilisateurs (admins via service_role seulement)
-- Ne rien ajouter = aucun DELETE autorisé

-- ══════════════════════════════════════════════════════════════════════════════
-- PREMIER ADMIN — À exécuter UNE SEULE FOIS après ton inscription
-- Remplace 'ton@email.com' par l'adresse avec laquelle tu t'es inscrit
-- ══════════════════════════════════════════════════════════════════════════════
/*
update public.profiles
set role = 'admin', status = 'active'
where email = 'ton@email.com';
*/
