-- ============================================================
--  LA GÉRANTE — Base de données (ÉTAPE 1)
--  Coller tout ce script dans SQL Editor puis Run
--  ATTENTION : ce script efface tout au début. À lancer seulement
--  quand la base est vide, jamais avec de vraies données.
-- ============================================================

-- ---------- Si on relance le script, on repart de zéro ----------
drop table if exists public.mouvements_stock cascade;
drop table if exists public.paiements cascade;
drop table if exists public.consommations cascade;
drop table if exists public.clients cascade;
drop table if exists public.produits cascade;
drop table if exists public.profiles cascade;
drop table if exists public.teams cascade;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.voir_client(uuid);
drop function if exists public.user_role();
drop function if exists public.user_team_id();

-- ---------- Les 7 tables ----------

-- 1) ÉTABLISSEMENTS (Bar, Snack-bar, Boîte de nuit)
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  type text not null default 'bar'
    check (type in ('bar','snack','boite')),
  code_invitation text not null unique,
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2) PROFILS (tous les utilisateurs)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null default 'Membre',
  role text not null default 'serveuse'
    check (role in ('proprietaire','manager','serveuse')),
  team_id uuid references public.teams(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 3) PRODUITS (boissons et articles)
create table public.produits (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  nom text not null,
  prix numeric(12,0) not null default 0 check (prix >= 0),
  icone text not null default '🍹',
  img text not null default '',
  stock integer not null default 0 check (stock >= 0),
  popularite integer not null default 0,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4) CLIENTS (une facture ouverte)
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  serveuse_id uuid not null references public.profiles(id),
  numero integer not null default 1,
  nom text,
  statut text not null default 'en_cours'
    check (statut in ('en_cours','paye','ardoise')),
  total numeric(12,0) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) CONSOMMATIONS (les lignes de la facture)
create table public.consommations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  produit_id uuid not null references public.produits(id),
  quantite integer not null default 1 check (quantite > 0),
  prix_unitaire numeric(12,0) not null check (prix_unitaire >= 0),
  created_at timestamptz not null default now()
);

-- 6) PAIEMENTS (encaissements)
create table public.paiements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  serveuse_id uuid not null references public.profiles(id),
  montant numeric(12,0) not null check (montant > 0),
  type text not null default 'especes'
    check (type in ('especes','carte','momo','ardoise')),
  created_at timestamptz not null default now()
);

-- 7) MOUVEMENTS DE STOCK (entrées et sorties)
create table public.mouvements_stock (
  id uuid primary key default gen_random_uuid(),
  produit_id uuid not null references public.produits(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  type text not null
    check (type in ('vente','livraison','ajustement','retour')),
  quantite integer not null,
  motif text not null default '',
  cree_par uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- Fonctions internes utilisées par la sécurité ----------

create or replace function public.user_team_id()
returns uuid language sql security definer stable
set search_path = public
as $$
  select team_id from public.profiles where id = auth.uid() limit 1;
$$;

create or replace function public.user_role()
returns text language sql security definer stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

create or replace function public.voir_client(p_client uuid)
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.clients c
    where c.id = p_client
      and (
        c.serveuse_id = auth.uid()
        or (public.user_role() in ('manager','proprietaire')
            and c.team_id = public.user_team_id())
      )
  );
$$;

-- ---------- Règles de sécurité (Row Level Security) ----------

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.produits enable row level security;
alter table public.clients enable row level security;
alter table public.consommations enable row level security;
alter table public.paiements enable row level security;
alter table public.mouvements_stock enable row level security;

-- PROFILES
create policy "profiles select"
on public.profiles for select to authenticated
using (id = auth.uid() or team_id = public.user_team_id());

create policy "profiles update"
on public.profiles for update to authenticated
using (id = auth.uid()
  and role = public.user_role()
  and team_id is not distinct from public.user_team_id());

-- TEAMS
create policy "teams select"
on public.teams for select to authenticated
using (id = public.user_team_id() or created_by = auth.uid());

create policy "teams insert"
on public.teams for insert to authenticated
with check (created_by = auth.uid());

create policy "teams update"
on public.teams for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "teams delete"
on public.teams for delete to authenticated
using (created_by = auth.uid());

-- PRODUITS
create policy "produits select"
on public.produits for select to authenticated
using (team_id = public.user_team_id());

create policy "produits insert"
on public.produits for insert to authenticated
with check (team_id = public.user_team_id()
  and public.user_role() in ('manager','proprietaire'));

create policy "produits update"
on public.produits for update to authenticated
using (team_id = public.user_team_id()
  and public.user_role() in ('manager','proprietaire'))
with check (team_id = public.user_team_id()
  and public.user_role() in ('manager','proprietaire'));

create policy "produits delete"
on public.produits for delete to authenticated
using (team_id = public.user_team_id()
  and public.user_role() in ('manager','proprietaire'));

-- CLIENTS
create policy "clients select"
on public.clients for select to authenticated
using (serveuse_id = auth.uid()
  or (public.user_role() in ('manager','proprietaire')
      and team_id = public.user_team_id()));

create policy "clients insert"
on public.clients for insert to authenticated
with check (team_id = public.user_team_id() and serveuse_id = auth.uid());

create policy "clients update"
on public.clients for update to authenticated
using (serveuse_id = auth.uid()
  or (public.user_role() in ('manager','proprietaire')
      and team_id = public.user_team_id()))
with check (team_id = public.user_team_id());

create policy "clients delete"
on public.clients for delete to authenticated
using (public.user_role() = 'proprietaire'
  and team_id = public.user_team_id());

-- CONSOMMATIONS
create policy "consos select"
on public.consommations for select to authenticated
using (public.voir_client(client_id));

create policy "consos insert"
on public.consommations for insert to authenticated
with check (public.voir_client(client_id)
  and produit_id in (select id from public.produits
                     where team_id = public.user_team_id()));

create policy "consos update"
on public.consommations for update to authenticated
using (public.voir_client(client_id))
with check (public.voir_client(client_id));

create policy "consos delete"
on public.consommations for delete to authenticated
using (public.voir_client(client_id));

-- PAIEMENTS
create policy "paiements select"
on public.paiements for select to authenticated
using (public.voir_client(client_id));

create policy "paiements insert"
on public.paiements for insert to authenticated
with check (public.voir_client(client_id)
  and team_id = public.user_team_id()
  and serveuse_id = auth.uid());

create policy "paiements update"
on public.paiements for update to authenticated
using (public.user_role() in ('manager','proprietaire')
  and team_id = public.user_team_id())
with check (public.user_role() in ('manager','proprietaire')
  and team_id = public.user_team_id());

create policy "paiements delete"
on public.paiements for delete to authenticated
using (public.user_role() in ('manager','proprietaire')
  and team_id = public.user_team_id());

-- MOUVEMENTS STOCK (écritures via fonctions protégées à l'ÉTAPE 6)
create policy "mouvements stock select"
on public.mouvements_stock for select to authenticated
using (team_id = public.user_team_id());

-- ---------- Profil créé automatiquement à l'inscription ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nom)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nom', 'Membre'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- Index pour la rapidité ----------
create index if not exists idx_profiles_team on public.profiles(team_id);
create index if not exists idx_produits_team on public.produits(team_id);
create index if not exists idx_clients_team on public.clients(team_id);
create index if not exists idx_clients_serveuse on public.clients(serveuse_id);
create index if not exists idx_consos_client on public.consommations(client_id);
create index if not exists idx_paiements_client on public.paiements(client_id);
create index if not exists idx_paiements_team on public.paiements(team_id);
create index if not exists idx_mvt_produit on public.mouvements_stock(produit_id);
create index if not exists idx_mvt_team on public.mouvements_stock(team_id);