"use client";

import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  bar: "Bar",
  snack: "Snack-bar",
  boite: "Boîte de nuit",
};

const ROLE_LABELS: Record<string, string> = {
  proprietaire: "Propriétaire",
  manager: "Manager",
  serveuse: "Serveuse",
};

export default function Dashboard({ profile }: { profile: Profile }) {
  const team = profile.teams;
  // Le code d'invitation n'est visible que par le propriétaire et le manager.
  const canSeeInvite =
    profile.role === "proprietaire" || profile.role === "manager";

  async function handleSignOut() {
    await supabase?.auth.signOut();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#3a2d22] bg-[#241a14] p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e8a33d]">
          Établissement
        </div>
        <h2 className="mt-1 text-2xl font-bold text-[#f3ece0]">
          {team?.nom ?? "—"}
        </h2>
        <p className="mt-1 text-sm text-[#b8ab98]">
          {team ? (TYPE_LABELS[team.type] ?? team.type) : "Type inconnu"}
        </p>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#1b1410] px-4 py-3">
          <span className="text-sm text-[#b8ab98]">Ton rôle</span>
          <span className="text-sm font-semibold text-[#f3ece0]">
            {ROLE_LABELS[profile.role] ?? profile.role}
          </span>
        </div>

        {canSeeInvite && team?.code_invitation && (
          <div className="mt-2 flex items-center justify-between rounded-xl bg-[#1b1410] px-4 py-3">
            <span className="text-sm text-[#b8ab98]">Code d&apos;invitation</span>
            <span className="font-mono text-lg font-bold tracking-widest text-[#e8a33d]">
              {team.code_invitation}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="w-full rounded-xl border border-[#3a2d22] px-4 py-2.5 font-semibold text-[#b8ab98] transition hover:border-[#d9714e] hover:text-[#d9714e]"
      >
        Se déconnecter
      </button>
    </div>
  );
}
