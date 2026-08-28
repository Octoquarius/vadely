"use client";

import { useActionState } from "react";
import { faturaEkle, type IslemDurum } from "../actions";

const baslangic: IslemDurum = {};

export function FaturaForm({
  musteriler,
}: {
  musteriler: { id: string; unvan: string }[];
}) {
  const [durum, eylem, bekliyor] = useActionState(faturaEkle, baslangic);

  if (musteriler.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500">
        You must create a customer before you can add an invoice.
      </div>
    );
  }

  return (
    <form
      action={eylem}
      className="rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h2 className="text-sm font-semibold text-zinc-900">New invoice</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-5">
        <select
          name="musteri_id"
          required
          defaultValue=""
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        >
          <option value="" disabled>
            Select customer *
          </option>
          {musteriler.map((musteri) => (
            <option key={musteri.id} value={musteri.id}>
              {musteri.unvan}
            </option>
          ))}
        </select>
        <input
          name="fatura_no"
          required
          placeholder="Invoice no *"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
        <input
          name="fatura_tarihi"
          type="date"
          required
          title="Invoice date"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
        <input
          name="vade_tarihi"
          type="date"
          required
          title="Due date"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
        <input
          name="tutar"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="Amount (TL) *"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
      </div>
      {durum.hata && (
        <p className="mt-2 text-sm text-red-600">{durum.hata}</p>
      )}
      <button
        type="submit"
        disabled={bekliyor}
        className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {bekliyor ? "Adding…" : "Add invoice"}
      </button>
    </form>
  );
}
