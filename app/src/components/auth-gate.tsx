"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import SupabaseStatus from "@/components/supabase-status";
import AuthForm from "@/components/auth-form";
import EstablishmentGate from "@/components/establishment-gate";
import Dashboard from "@/components/dashboard";

export default function AuthGate() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // La configuration est figée au chargement du module : on peut l'utiliser
  // pour l'état initial (évite un setState synchrone dans l'effet).
  const [loading, setLoading] = useState(() => !isSupabaseConfigured);

  async function refreshProfile(id: string) {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nom, role, team_id, teams(id, nom, type, code_invitation)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      setProfile(null);
      return;
    }

    // Sans types générés, supabase-js infère "teams" (jointure many-to-one)
    // comme un tableau, alors qu'à l'exécution c'est un objet. On normalise.
    const row = data as unknown as {
      id: string;
      nom: string;
      role: string;
      team_id: string | null;
      teams:
        | { id: string; nom: string; type: string; code_invitation: string }
        | { id: string; nom: string; type: string; code_invitation: string }[]
        | null;
    };
    const team = Array.isArray(row.teams) ? row.teams[0] ?? null : row.teams;

    setProfile({
      id: row.id,
      nom: row.nom,
      role: row.role,
      team_id: row.team_id,
      teams: team,
    });
  }

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const id = data.user?.id ?? null;
      setUserId(id);
      if (id) refreshProfile(id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (id) refreshProfile(id);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured) {
    return <SupabaseStatus />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#3a2d22] bg-[#241a14] p-5">
        <span className="h-3 w-3 animate-pulse rounded-full bg-[#e8a33d]" />
        <p className="text-sm text-[#b8ab98]">Chargement…</p>
      </div>
    );
  }

  if (!userId) {
    return <AuthForm />;
  }

  if (!profile?.team_id) {
    return <EstablishmentGate onDone={() => refreshProfile(userId)} />;
  }

  return <Dashboard profile={profile} />;
}
