"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#3a2d22] bg-[#1b1410] px-4 py-2.5 text-[#f3ece0] placeholder-[#7a6c5c] outline-none transition focus:border-[#e8a33d]";

const BTN_CLASS =
  "w-full rounded-xl bg-[#e8a33d] px-4 py-2.5 font-semibold text-[#1b1410] transition hover:brightness-110 disabled:opacity-50";

function traduireErreur(message: string): string {
  if (message.includes("User already registered")) {
    return "Un compte existe déjà avec cet e-mail.";
  }
  if (message.includes("Invalid login credentials")) {
    return "E-mail ou mot de passe incorrect.";
  }
  if (message.includes("Password should be at least")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (message.includes("Email not confirmed")) {
    return "E-mail non confirmé. Vérifie ta boîte mail puis connecte-toi.";
  }
  return message;
}

export default function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nom: nom.trim() || "Membre" } },
        });
        if (error) throw error;
        if (data.session) {
          setMessage("Compte créé. Bienvenue !");
        } else {
          setMessage(
            "Compte créé ! Confirme ton e-mail (lien envoyé) puis connecte-toi."
          );
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      const e = err as { message?: string };
      setError(traduireErreur(e.message ?? "Une erreur est survenue."));
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setError(null);
    setMessage(null);
  }

  const isSignup = mode === "signup";

  return (
    <div className="rounded-2xl border border-[#3a2d22] bg-[#241a14] p-6">
      <div className="mb-5 flex gap-2 rounded-xl bg-[#1b1410] p-1">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            !isSignup
              ? "bg-[#e8a33d] text-[#1b1410]"
              : "text-[#b8ab98] hover:text-[#f3ece0]"
          }`}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            isSignup
              ? "bg-[#e8a33d] text-[#1b1410]"
              : "text-[#b8ab98] hover:text-[#f3ece0]"
          }`}
        >
          Inscription
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <input
            className={INPUT_CLASS}
            type="text"
            placeholder="Ton nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        )}
        <input
          className={INPUT_CLASS}
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={INPUT_CLASS}
          type="password"
          required
          minLength={6}
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="rounded-xl bg-[#d9714e]/10 px-3 py-2 text-sm text-[#d9714e]">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-xl bg-[#6fae82]/10 px-3 py-2 text-sm text-[#6fae82]">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} className={BTN_CLASS}>
          {loading
            ? "Patientez…"
            : isSignup
              ? "Créer mon compte"
              : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
