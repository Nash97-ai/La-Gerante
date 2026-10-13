"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#3a2d22] bg-[#1b1410] px-4 py-2.5 text-center font-mono text-2xl tracking-[0.5em] text-[#f3ece0] placeholder-[#7a6c5c] outline-none transition focus:border-[#e8a33d]";

const BTN_CLASS =
  "w-full rounded-xl bg-[#e8a33d] px-4 py-2.5 font-semibold text-[#1b1410] transition hover:brightness-110 disabled:opacity-50";

export default function JoinEstablishment({
  onJoined,
}: {
  onJoined: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("rejoindre_etablissement", {
        p_code: code.trim(),
      });
      if (error) throw error;
      if (!data) throw new Error("Aucun établissement retourné.");
      onJoined();
    } catch (err) {
      const e = err as { message?: string };
      setError(
        e.message === "Failed to fetch"
          ? "Impossible de joindre le serveur. Vérifie ta connexion."
          : e.message ??
              "Impossible de rejoindre. A-t-on bien lancé le script SQL dans Supabase ?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#3a2d22] bg-[#241a14] p-6">
      <h2 className="text-lg font-semibold text-[#f3ece0]">
        Rejoindre un établissement
      </h2>
      <p className="mb-5 mt-1 text-sm text-[#b8ab98]">
        Demande le code d&apos;invitation au propriétaire. Tu rejoins en tant que
        serveuse.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className={INPUT_CLASS}
          type="text"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          placeholder="••••"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />

        {error && (
          <p className="rounded-xl bg-[#d9714e]/10 px-3 py-2 text-sm text-[#d9714e]">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={BTN_CLASS}>
          {loading ? "Connexion…" : "Rejoindre"}
        </button>
      </form>
    </div>
  );
}
