"use client";

import { useActionState } from "react";
import { musteriEkle, type IslemDurum } from "../actions";

const baslangic: IslemDurum = {};

export function MusteriForm() {
  const [durum, eylem, bekliyor] = useActionState(musteriEkle, baslangic);

  return (
    <form
      action={eylem}
      className="rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h2 className="text-sm font-semibold text-zinc-900">New customer</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <input
          name="unvan"
          required
          placeholder="Company name *"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
        <input
          name="vkn"
          placeholder="Tax ID"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
        <input
          name="eposta"
          type="email"
          placeholder="Email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
        <input
          name="telefon"
          placeholder="Phone"
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
        {bekliyor ? "Adding…" : "Add customer"}
      </button>
    </form>
  );
}
