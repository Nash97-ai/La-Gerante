"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { TeamMember } from "@/lib/types";

const ROLE_LABELS: Record<string, string> = {
  proprietaire: "Propriétaire",
  manager: "Manager",
  serveuse: "Serveuse",
};

const ROLE_DOT: Record<string, string> = {
  proprietaire: "bg-[#e8a33d]",
  manager: "bg-[#6fae82]",
  serveuse: "bg-[#b8ab98]",
};

export default function TeamSection({ teamId }: { teamId: string }) {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase
      .from("profiles")
      .select("id, nom, role")
      .eq("team_id", teamId)
      .order("created_at")
      .then(({ data, error }) => {
        if (!active) return;
        if (!error) setMembers((data as TeamMember[]) ?? []);
        else setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [teamId]);

  return (
    <div className="rounded-2xl border border-[#3a2d22] bg-[#241a14] p-6">
      <h2 className="text-lg font-semibold text-[#f3ece0]">Mon équipe</h2>

      {error && (
        <p className="mt-3 rounded-xl bg-[#d9714e]/10 px-3 py-2 text-sm text-[#d9714e]">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {members === null && (
          <li className="text-sm text-[#b8ab98]">Chargement…</li>
        )}
        {members !== null && members.length === 0 && (
          <li className="text-sm text-[#b8ab98]">Personne dans l&apos;équipe.</li>
        )}
        {members?.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-3 rounded-xl bg-[#1b1410] px-4 py-3"
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${ROLE_DOT[m.role] ?? "bg-[#b8ab98]"}`}
            />
            <div className="min-w-0 flex-1 truncate font-semibold text-[#f3ece0]">
              {m.nom || "Membre"}
            </div>
            <span className="shrink-0 text-sm text-[#b8ab98]">
              {ROLE_LABELS[m.role] ?? m.role}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
