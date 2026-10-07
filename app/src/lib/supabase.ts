import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vrai si les deux clés publiques sont présentes dans .env.local
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Client Supabase navigateur — jamais interrogé côté serveur.
// Tant que .env.local n'est pas rempli, il vaut null (l'app fonctionne sans).
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;