"use client";

import { useActionState } from "react";
import { odemeEkle, type IslemDurum } from "./actions";

const baslangic: IslemDurum = {};

export function OdemeForm({
  musteriler,
}: {
  musteriler: { id: string; unvan: string }[];
}) {
  const [durum, eylem, bekliyor] = useActionState(odemeEkle, baslangic);

  return (
    <form
      action={eylem}
      className="rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h2 className="text-sm font-semibold text-zinc-900">Yeni ödeme</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <select
          name="musteri_id"
          defaultValue=""
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        >
          <option value="">Müşteri (isteğe bağlı)</option>
          {musteriler.map((musteri) => (
            <option key={musteri.id} value={musteri.id}>
              {musteri.unvan}
            </option>
          ))}
        </select>
        <input
          name="tutar"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="Tutar (TL) *"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
        <input
          name="odeme_tarihi"
          type="date"
          required
          title="Ödeme tarihi"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
        <input
          name="aciklama"
          placeholder="Açıklama"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
      </div>
      {durum.hata && <p className="mt-2 text-sm text-red-600">{durum.hata}</p>}
      <button
        type="submit"
        disabled={bekliyor}
        className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {bekliyor ? "Ekleniyor…" : "Ödeme ekle"}
      </button>
    </form>
  );
}
