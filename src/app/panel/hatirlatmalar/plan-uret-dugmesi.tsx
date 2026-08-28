"use client";

import { useActionState } from "react";
import { planUret, type IslemDurum } from "./actions";

const baslangic: IslemDurum = {};

export function PlanUretDugmesi() {
  const [durum, eylem, bekliyor] = useActionState(planUret, baslangic);

  return (
    <form action={eylem} className="flex items-center gap-3">
      {durum.mesaj && (
        <span className="text-sm text-green-700">{durum.mesaj}</span>
      )}
      {durum.hata && <span className="text-sm text-red-600">{durum.hata}</span>}
      <button
        type="submit"
        disabled={bekliyor}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {bekliyor ? "Generating…" : "Generate plan now"}
      </button>
    </form>
  );
}
