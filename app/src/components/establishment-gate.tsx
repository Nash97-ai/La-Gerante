"use client";

import { useState } from "react";
import CreateEstablishment from "@/components/create-establishment";
import JoinEstablishment from "@/components/join-establishment";

const TAB_CLASS =
  "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition";

export default function EstablishmentGate({ onDone }: { onDone: () => void }) {
  const [tab, setTab] = useState<"create" | "join">("create");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-xl bg-[#241a14] p-1">
        <button
          type="button"
          onClick={() => setTab("create")}
          className={`${TAB_CLASS} ${
            tab === "create"
              ? "bg-[#e8a33d] text-[#1b1410]"
              : "text-[#b8ab98] hover:text-[#f3ece0]"
          }`}
        >
          Créer
        </button>
        <button
          type="button"
          onClick={() => setTab("join")}
          className={`${TAB_CLASS} ${
            tab === "join"
              ? "bg-[#e8a33d] text-[#1b1410]"
              : "text-[#b8ab98] hover:text-[#f3ece0]"
          }`}
        >
          Rejoindre
        </button>
      </div>

      {tab === "create" ? (
        <CreateEstablishment onCreated={onDone} />
      ) : (
        <JoinEstablishment onJoined={onDone} />
      )}
    </div>
  );
}
