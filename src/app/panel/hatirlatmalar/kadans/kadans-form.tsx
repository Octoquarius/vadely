"use client";

import { useActionState } from "react";
import { SABLON_ETIKETLERI } from "@/lib/sabitler";
import { kadansEkle, type IslemDurum } from "../actions";

const baslangic: IslemDurum = {};

export function KadansForm() {
  const [durum, eylem, bekliyor] = useActionState(kadansEkle, baslangic);

  return (
    <form
      action={eylem}
      className="rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h2 className="text-sm font-semibold text-zinc-900">Yeni adım</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="text-sm text-zinc-700">
          Gün farkı (eksi = vadeden önce)
          <input
            name="gun_farki"
            type="number"
            min={-60}
            max={365}
            required
            placeholder="örn. 30"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </label>
        <label className="text-sm text-zinc-700">
          Şablon tonu
          <select
            name="sablon_kodu"
            required
            defaultValue="nazik_gecikme"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          >
            {Object.entries(SABLON_ETIKETLERI).map(([kod, etiket]) => (
              <option key={kod} value={kod}>
                {etiket}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={bekliyor}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {bekliyor ? "Ekleniyor…" : "Adım ekle"}
          </button>
        </div>
      </div>
      {durum.hata && <p className="mt-2 text-sm text-red-600">{durum.hata}</p>}
      <p className="mt-3 text-xs text-zinc-500">
        Kanal şimdilik e-posta; SMS ve WhatsApp sonraki sürümde eklenecek.
      </p>
    </form>
  );
}
