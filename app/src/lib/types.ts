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

export type Product = {
  id: string;
  team_id: string;
  nom: string;
  prix: number | string;
  icone: string;
  img: string;
  stock: number | string;
  popularite: number;
  actif: boolean;
  created_at: string;
};

export type TeamMember = {
  id: string;
  nom: string;
  role: string;
};
