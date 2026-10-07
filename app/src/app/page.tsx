import SupabaseStatus from "@/components/supabase-status";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#1b1410] px-6">
      <main className="w-full max-w-md">
        <h1 className="text-4xl font-bold leading-none text-[#e8a33d]">La Gérante</h1>
        <p className="mb-10 mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#b8ab98]">
          Application de gestion
        </p>
        <SupabaseStatus />
      </main>
    </div>
  );
}
