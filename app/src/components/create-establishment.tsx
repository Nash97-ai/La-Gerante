"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

const TYPES = [
  { value: "bar", label: "Bar" },
  { value: "snack", label: "Snack-bar" },
  { value: "boite", label: "Boîte de nuit" },
] as const;

const INPUT_CLASS =
  "w-full rounded-xl border border-[#3a2d22] bg-[#1b1410] px-4 py-2.5 text-[#f3ece0] placeholder-[#7a6c5c] outline-none transition focus:border-[#e8a33d]";

const BTN_CLASS =
  "w-full rounded-xl bg-[#e8a33d] px-4 py-2.5 font-semibold text-[#1b1410] transition hover:brightness-110 disabled:opacity-50";

export default function CreateEstablishment({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [nom, setNom] = useState("");
  const [type, setType] = useState<string>("bar");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("creer_etablissement", {
        p_nom: nom,
        p_type: type,
      });
      if (error) throw error;
      if (!data) throw new Error("Aucun établissement retourné.");
      onCreated();
    } catch (err) {
      const e = err as { message?: string };
      setError(
        e.message === "Failed to fetch"
          ? "Impossible de joindre le serveur. Vérifie ta connexion."
          : e.message ??
              "Impossible de créer l'établissement. A-t-on bien lancé le script SQL ÉTAPE 3 dans Supabase ?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#3a2d22] bg-[#241a14] p-6">
      <h2 className="text-lg font-semibold text-[#f3ece0]">
        Créer ton établissement
      </h2>
      <p className="mb-5 mt-1 text-sm text-[#b8ab98]">
        Tu es le premier utilisateur : tu en deviens le propriétaire.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className={INPUT_CLASS}
          type="text"
          required
          placeholder="Nom de l'établissement (ex : Le Perroquet)"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
                type === t.value
                  ? "border-[#e8a33d] bg-[#e8a33d]/10 text-[#e8a33d]"
                  : "border-[#3a2d22] bg-[#1b1410] text-[#b8ab98] hover:text-[#f3ece0]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded-xl bg-[#d9714e]/10 px-3 py-2 text-sm text-[#d9714e]">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={BTN_CLASS}>
          {loading ? "Création…" : "Créer mon établissement"}
        </button>
      </form>
    </div>
  );
}
