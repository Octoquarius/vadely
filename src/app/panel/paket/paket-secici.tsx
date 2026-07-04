"use client";

import { useActionState, useState } from "react";
import { PAKETLER } from "@/lib/paketler";
import { paketSec, type IslemDurum } from "./actions";

const baslangicDurum: IslemDurum = {};

export function PaketSecici({
  aktifPaket,
  aktifDonem,
  secebilir,
}: {
  aktifPaket: string;
  aktifDonem: string;
  secebilir: boolean;
}) {
  const [donem, setDonem] = useState<"aylik" | "yillik">(
    aktifDonem === "yillik" ? "yillik" : "aylik"
  );
  const [durum, eylem, bekliyor] = useActionState(paketSec, baslangicDurum);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1">
          <button
            onClick={() => setDonem("aylik")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${
              donem === "aylik"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            Aylık
          </button>
          <button
            onClick={() => setDonem("yillik")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${
              donem === "yillik"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            Yıllık <span className="text-emerald-500">(~2 ay bedava)</span>
          </button>
        </div>
      </div>

      {durum.mesaj && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-center text-sm text-green-700">
          {durum.mesaj}
        </p>
      )}
      {durum.hata && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {durum.hata}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PAKETLER.map((paket) => {
          const seciliMi = aktifPaket === paket.kod;
          return (
            <div
              key={paket.kod}
              className={`flex flex-col rounded-xl border bg-white p-6 ${
                paket.one_cikan
                  ? "border-emerald-400 shadow-sm"
                  : "border-zinc-200"
              }`}
            >
              {paket.one_cikan && (
                <span className="mb-2 w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  En çok tercih edilen
                </span>
              )}
              <h3 className="text-lg font-semibold text-zinc-900">
                {paket.ad}
              </h3>
              <p className="text-sm text-zinc-500">{paket.ozet}</p>
              <p className="mt-3">
                <span className="text-3xl font-bold text-zinc-900">
                  ${donem === "aylik" ? paket.aylikUsd : paket.yillikUsd}
                </span>
                <span className="text-sm text-zinc-500">
                  {" "}
                  / {donem === "aylik" ? "ay" : "yıl"}
                </span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-zinc-600">
                {paket.ozellikler.map((ozellik) => (
                  <li key={ozellik} className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    {ozellik}
                  </li>
                ))}
              </ul>
              <form action={eylem} className="mt-5">
                <input type="hidden" name="paket" value={paket.kod} />
                <input type="hidden" name="donem" value={donem} />
                <button
                  type="submit"
                  disabled={!secebilir || bekliyor || seciliMi}
                  className={`w-full rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60 ${
                    paket.one_cikan
                      ? "bg-emerald-700 text-white hover:bg-emerald-600"
                      : "bg-zinc-900 text-white hover:bg-zinc-700"
                  }`}
                >
                  {seciliMi
                    ? "Mevcut paketiniz"
                    : bekliyor
                      ? "Kaydediliyor…"
                      : "Bu paketi seç"}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {!secebilir && (
        <p className="text-center text-sm text-zinc-500">
          Paket seçimini yalnızca hesap sahibi yapabilir.
        </p>
      )}
      <p className="text-center text-xs text-zinc-400">
        Fiyatlar USD&apos;dir; tahsilat TL karşılığıyla yapılır. Mesajlaşma
        (SMS/WhatsApp) kullandıkça öde kontör modeliyle ayrıca ücretlendirilir.
      </p>
    </div>
  );
}
