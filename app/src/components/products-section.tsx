"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import ProductForm from "@/components/product-form";

export default function ProductsSection({
  teamId,
  canManage,
}: {
  teamId: string;
  canManage: boolean;
}) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("produits")
      .select("*")
      .eq("team_id", teamId)
      .order("nom");
    if (error) return { products: null, error: error.message };
    return { products: (data as Product[]) ?? [], error: null };
  }, [teamId]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    fetchProducts().then((result) => {
      if (!active || !result) return;
      if (result.error) setError(result.error);
      else setProducts(result.products);
    });
    return () => {
      active = false;
    };
  }, [fetchProducts]);

  async function load() {
    const result = await fetchProducts();
    if (!result) return;
    if (result.error) setError(result.error);
    else setProducts(result.products);
  }

  async function handleDelete(p: Product) {
    if (!supabase) return;
    if (!window.confirm(`Supprimer « ${p.nom} » ?`)) return;
    const { error } = await supabase.from("produits").delete().eq("id", p.id);
    if (error) setError(error.message);
    else load();
  }

  function closeForm() {
    setAdding(false);
    setEditing(null);
  }

  return (
    <div className="rounded-2xl border border-[#3a2d22] bg-[#241a14] p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#f3ece0]">Produits</h2>
        {canManage && !adding && !editing && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-xl bg-[#e8a33d] px-3 py-1.5 text-sm font-semibold text-[#1b1410] transition hover:brightness-110"
          >
            + Ajouter
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-[#d9714e]/10 px-3 py-2 text-sm text-[#d9714e]">
          {error}
        </p>
      )}

      {(adding || editing) && (
        <div className="mt-4">
          <ProductForm
            teamId={teamId}
            product={editing}
            onDone={() => {
              closeForm();
              load();
            }}
            onCancel={closeForm}
          />
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {products === null && (
          <li className="text-sm text-[#b8ab98]">Chargement…</li>
        )}
        {products !== null && products.length === 0 && (
          <li className="text-sm text-[#b8ab98]">
            Aucun produit pour le moment.
          </li>
        )}
        {products?.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-xl bg-[#1b1410] px-4 py-3"
          >
            <span className="text-2xl">{p.icone}</span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[#f3ece0]">{p.nom}</div>
              <div className="text-sm text-[#b8ab98]">
                {Number(p.prix)} FCFA · Stock : {p.stock}
              </div>
            </div>
            {canManage && (
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  className="rounded-lg border border-[#3a2d22] px-2.5 py-1 text-xs font-semibold text-[#b8ab98] transition hover:border-[#e8a33d] hover:text-[#e8a33d]"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  className="rounded-lg border border-[#3a2d22] px-2.5 py-1 text-xs font-semibold text-[#b8ab98] transition hover:border-[#d9714e] hover:text-[#d9714e]"
                >
                  Suppr.
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
