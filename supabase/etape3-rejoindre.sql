-- ============================================================
--  LA GÉRANTE — ÉTAPE 3 (suite) : rejoindre un établissement
--  À faire relire avant de lancer (SQL Editor Supabase).
--  Aucun "drop table" : script sûr à relancer.
--  Le code d'invitation est à 4 chiffres (version lancée).
-- ============================================================

-- 1) Fonction : rejoindre un établissement avec son code.
--    La personne rejoint TOUJOURS en tant que "serveuse",
--    et seulement si elle n'a pas déjà d'établissement.
create or replace function public.rejoindre_etablissement(
  p_code text
) returns public.teams
language plpgsql security definer
set search_path = public
as $$
declare
  v_team public.teams;
begin
  -- a) L'appelant doit être connecté (auth.uid() non nul)
  if auth.uid() is null then
    raise exception 'Vous devez être connecté pour rejoindre un établissement';
  end if;

  -- b) Un code doit être fourni
  if p_code is null or trim(p_code) = '' then
    raise exception 'Saisis le code d''invitation de l''établissement';
  end if;

  -- c) Recherche de l'établissement par code (unique)
  select * into v_team
  from public.teams
  where code_invitation = trim(p_code);

  if not found then
    raise exception 'Code d''invitation invalide. Vérifie le code et réessaie.';
  end if;

  -- d) L'utilisateur ne doit pas déjà avoir d'établissement
  if exists (
    select 1 from public.profiles
    where id = auth.uid() and team_id is not null
  ) then
    raise exception 'Vous avez déjà un établissement.';
  end if;

  -- e) L'utilisateur rejoint comme "serveuse".
  --    Upsert pour couvrir la latence du trigger à l'inscription.
  insert into public.profiles (id, nom, role, team_id)
  values (auth.uid(), 'Membre', 'serveuse', v_team.id)
  on conflict (id) do update
    set team_id = v_team.id,
        role = 'serveuse';

  return v_team;
end;
$$;

-- 2) Droits d'exécution : réservé aux utilisateurs connectés
revoke execute on function public.rejoindre_etablissement(text) from public;
grant execute on function public.rejoindre_etablissement(text) to authenticated;
