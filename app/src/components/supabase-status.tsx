"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase, supabaseUrl } from "@/lib/supabase";

type State =
  | { status: "missing-config" }
  | { status: "checking" }
  | { status: "ok"; detail: string }
  | { status: "error"; detail: string };

const SIMPLE_INFOS = {
  "missing-config": {
    dot: "bg-[#d9714e]",
    title: "Clés manquantes",
    text: "Crée app/.env.local à partir de app/.env.example et colle tes clés Supabase.",
  },
  checking: {
    dot: "bg-[#e8a33d] animate-pulse",
    title: "Connexion à Supabase…",
    text: "Vérification de la clé publique (anon) en cours.",
  },
} as const;

export default function SupabaseStatus() {
  const [state, setState] = useState<State>(() =>
    isSupabaseConfigured ? { status: "checking" } : { status: "missing-config" }
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth
      .getUser()
      .then(({ error }) => {
        if (error) {
          setState({ status: "error", detail: error.message });
        } else {
          setState({ status: "ok", detail: supabaseUrl ?? "URL inconnue" });
        }
      })
      .catch((err: Error) => {
        setState({ status: "error", detail: err.message });
      });
  }, []);

  let dotClass: string;
  let title: string;
  let text: string;

  if (state.status === "missing-config" || state.status === "checking") {
    const info = SIMPLE_INFOS[state.status];
    dotClass = info.dot;
    title = info.title;
    text = info.text;
  } else if (state.status === "ok") {
    dotClass = "bg-[#6fae82]";
    title = "Connecté à Supabase ✓";
    text = state.detail;
  } else {
    dotClass = "bg-[#d9714e]";
    title = "Connexion impossible";
    text = state.detail;
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#3a2d22] bg-[#241a14] p-5">
      <span className={`h-3 w-3 shrink-0 rounded-full ${dotClass}`} />
      <div className="min-w-0">
        <div className="font-semibold text-[#f3ece0]">{title}</div>
        <div className="mt-0.5 break-words text-sm text-[#b8ab98]">{text}</div>
      </div>
    </div>
  );
}