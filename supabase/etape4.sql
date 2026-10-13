-- ============================================================
--  LA GÉRANTE — ÉTAPE 4 : produits de départ pour chaque équipe
--  À faire relire avant de lancer (SQL Editor Supabase).
--  Aucun "drop table". Sûr à relancer (create or replace).
-- ============================================================

-- 1) Fonction déclenchée à la création d'un établissement :
--    insère automatiquement les 2 produits de test.
--    "security definer" : l'insertion se fait hors RLS.
create or replace function public.ajouter_produits_defaut()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.produits (team_id, nom, prix, icone, stock, actif)
  values
    (new.id, 'Régab', 600, '🍺', 0, true),
    (new.id, 'Beaufort', 800, '🥤', 0, true);
  return new;
end;
$$;

-- 2) Trigger après insertion dans public.teams.
--    "drop trigger if exists" = simple remplacement du déclencheur,
--    aucune donnée n'est supprimée (ce n'est pas un drop table).
drop trigger if exists on_team_created on public.teams;
create trigger on_team_created
after insert on public.teams
for each row execute function public.ajouter_produits_defaut();

-- 3) (Optionnel) Rattrapage pour les établissements DÉJÀ créés
--    qui n'ont encore aucun produit. Inoffensif à relancer :
--    chaque ligne n'est insérée que si l'équipe n'a aucun produit.
insert into public.produits (team_id, nom, prix, icone, stock, actif)
select t.id, 'Régab', 600, '🍺', 0, true
from public.teams t
where not exists (
  select 1 from public.produits p where p.team_id = t.id
);

insert into public.produits (team_id, nom, prix, icone, stock, actif)
select t.id, 'Beaufort', 800, '🥤', 0, true
from public.teams t
where not exists (
  select 1 from public.produits p where p.team_id = t.id
);
