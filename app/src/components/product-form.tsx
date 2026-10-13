"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#3a2d22] bg-[#1b1410] px-4 py-2.5 text-[#f3ece0] placeholder-[#7a6c5c] outline-none transition focus:border-[#e8a33d]";

const BTN_CLASS =
  "w-full rounded-xl bg-[#e8a33d] px-4 py-2.5 font-semibold text-[#1b1410] transition hover:brightness-110 disabled:opacity-50";

const ICONES = ["🍺", "🥤", "🍹", "🍾", "🥃", "🍷", "☕", "🧃", "🍟", "🍗"];

export default function ProductForm({
  teamId,
  product,
  onDone,
  onCancel,
}: {
  teamId: string;
  product?: Product | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const isEdit = Boolean(product);
  const [nom, setNom] = useState(product?.nom ?? "");
  const [prix, setPrix] = useState(product ? String(product.prix) : "");
  const [icone, setIcone] = useState(product?.icone || "🍹");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    const payload = {
      nom: nom.trim(),
      prix: Number(prix) || 0,
      icone: icone.trim() || "🍹",
      stock: Number(stock) || 0,
    };

    try {
      const { error } = isEdit
        ? await supabase.from("produits").update(payload).eq("id", product?.id)
        : await supabase.from("produits").insert({ ...payload, team_id: teamId });
      if (error) throw error;
      onDone();
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-[#3a2d22] bg-[#1b1410] p-4"
    >
      <div className="text-sm font-semibold text-[#e8a33d]">
        {isEdit ? "Modifier le produit" : "Nouveau produit"}
      </div>

      <input
        className={INPUT_CLASS}
        type="text"
        required
        placeholder="Nom (ex : Régab)"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          className={INPUT_CLASS}
          type="number"
          required
          min={0}
          placeholder="Prix en FCFA"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
        />
        <input
          className={INPUT_CLASS}
          type="number"
          required
          min={0}
          placeholder="Stock de départ"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#b8ab98]">
          Icône
        </div>
        <div className="flex flex-wrap gap-2">
          {ICONES.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcone(i)}
              className={`rounded-lg border px-2 py-1 text-xl transition ${
                icone === i
                  ? "border-[#e8a33d] bg-[#e8a33d]/10"
                  : "border-[#3a2d22] bg-[#241a14] hover:border-[#b8ab98]"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-[#d9714e]/10 px-3 py-2 text-sm text-[#d9714e]">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className={BTN_CLASS}>
          {loading ? "Enregistrement…" : isEdit ? "Enregistrer" : "Ajouter"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl border border-[#3a2d22] px-4 py-2.5 font-semibold text-[#b8ab98] transition hover:text-[#f3ece0]"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
