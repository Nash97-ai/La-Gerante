// Types partagés entre les composants de l'application.

export type Profile = {
  id: string;
  nom: string;
  role: string;
  team_id: string | null;
  teams: {
    id: string;
    nom: string;
    type: string;
    code_invitation: string;
  } | null;
};
