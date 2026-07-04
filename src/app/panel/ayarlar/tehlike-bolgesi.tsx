"use client";

import { useActionState, useState } from "react";
import { hesapSil, type IslemDurum } from "./actions";

const baslangic: IslemDurum = {};

export function TehlikeBolgesi({ sahipMi }: { sahipMi: boolean }) {
  const [onayMetni, setOnayMetni] = useState("");
  const [durum, eylem, bekliyor] = useActionState(hesapSil, baslangic);

  return (
    <div className="rounded-xl border border-red-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-red-700">Tehlikeli bölge</h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <p className="text-sm font-medium text-zinc-900">Verilerimi indir</p>
          <p className="text-sm text-zinc-500">
            Tüm hesap verinizin JSON kopyası (KVKK erişim hakkı).
          </p>
        </div>
        <a
          href="/api/veri-indir"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          İndir
        </a>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-zinc-900">Hesabı kalıcı sil</p>
        <p className="text-sm text-zinc-500">
          Tüm müşteriler, faturalar, ödemeler, hatırlatmalar ve kullanıcılar
          geri döndürülemez biçimde silinir. Önce verilerinizi indirin.
        </p>
        {sahipMi ? (
          <form action={eylem} className="mt-3 flex flex-wrap items-center gap-3">
            <input
              name="onay"
              value={onayMetni}
              onChange={(e) => setOnayMetni(e.target.value)}
              placeholder='Onay için "SIL" yazın'
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={onayMetni !== "SIL" || bekliyor}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40"
            >
              {bekliyor ? "Siliniyor…" : "Hesabı kalıcı olarak sil"}
            </button>
            {durum.hata && (
              <span className="text-sm text-red-600">{durum.hata}</span>
            )}
          </form>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">
            Hesabı yalnızca hesap sahibi silebilir.
          </p>
        )}
      </div>
    </div>
  );
}
