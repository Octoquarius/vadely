"use client";

import { useActionState } from "react";
import { odemeEslestir, type IslemDurum } from "../actions";

const baslangic: IslemDurum = {};

export function EslestirSatiri({
  odemeId,
  faturaId,
  onerilenTutar,
  azami,
}: {
  odemeId: string;
  faturaId: string;
  onerilenTutar: number;
  azami: number;
}) {
  const [durum, eylem, bekliyor] = useActionState(odemeEslestir, baslangic);

  return (
    <form action={eylem} className="flex items-center justify-end gap-2">
      <input type="hidden" name="odeme_id" value={odemeId} />
      <input type="hidden" name="fatura_id" value={faturaId} />
      <input
        name="tutar"
        type="number"
        step="0.01"
        min="0.01"
        max={azami}
        defaultValue={onerilenTutar.toFixed(2)}
        className="w-28 rounded-md border border-zinc-300 px-2 py-1.5 text-right text-sm focus:border-zinc-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={bekliyor}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {bekliyor ? "…" : "Eşleştir"}
      </button>
      {durum.hata && (
        <span className="text-xs text-red-600">{durum.hata}</span>
      )}
    </form>
  );
}
