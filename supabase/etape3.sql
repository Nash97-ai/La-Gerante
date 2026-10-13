-- ============================================================
--  LA GÉRANTE — ÉTAPE 3 : création d'un établissement
--  À faire relire avant de lancer (SQL Editor Supabase).
--  Aucun "drop table" : script sûr à relancer.
-- ============================================================

-- 1) Fonction qui crée l'établissement et lie l'utilisateur
--    comme propriétaire. Exécutée en "security definer" pour
--    contourner la RLS (un UPDATE classique ne permettrait pas
--    à l'utilisateur de changer son rôle / son team_id).
create or replace function public.creer_etablissement(
  p_nom text,
  p_type text
) returns public.teams
language plpgsql security definer
set search_path = public
as $$
declare
  v_code text;
  v_team public.teams;
begin
  -- a) L'utilisateur ne doit pas déjà avoir d'établissement
  if exists (
    select 1 from public.profiles
    where id = auth.uid() and team_id is not null
  ) then
    raise exception 'Vous avez déjà un établissement';
  end if;

  -- b) Vérifications des entrées
  if p_nom is null or trim(p_nom) = '' then
    raise exception 'Le nom de l''établissement est obligatoire';
  end if;
  if p_type not in ('bar','snack','boite') then
    raise exception 'Type d''établissement invalide';
  end if;

  -- c) Code d'invitation unique (8 caractères majuscules)
  loop
    v_code := upper(substr(md5(random()::text), 1, 8));
    exit when not exists (
      select 1 from public.teams where code_invitation = v_code
    );
  end loop;

  -- d) Création de l'établissement (created_by = auth.uid() via défaut)
  insert into public.teams (nom, type, code_invitation)
  values (trim(p_nom), p_type, v_code)
  returning * into v_team;

  -- e) L'utilisateur devient propriétaire de cet établissement.
  --    Upsert pour couvrir le cas où le profil n'est pas encore
  --    créé par le trigger (toute petite latence à l'inscription).
  insert into public.profiles (id, nom, role, team_id)
  values (auth.uid(), 'Membre', 'proprietaire', v_team.id)
  on conflict (id) do update
    set team_id = v_team.id,
        role = 'proprietaire';

  return v_team;
end;
$$;

-- 2) Droits d'exécution : réservé aux utilisateurs connectés
revoke execute on function public.creer_etablissement(text, text) from public;
grant execute on function public.creer_etablissement(text, text) to authenticated;
