"use client";

import { useActionState, useState } from "react";
import { faturaGuncelle, faturaSil, type IslemDurum } from "../actions";

const bos: IslemDurum = {};

type Fatura = {
  id: string;
  fatura_no: string;
  fatura_tarihi: string;
  vade_tarihi: string;
  tutar: number;
  kalan_bakiye: number;
  durum: string;
  musteri_unvan: string;
};

const DURUM: Record<string, { etiket: string; sinif: string }> = {
  acik: { etiket: "Açık", sinif: "bg-amber-50 text-amber-700" },
  kismi: { etiket: "Kısmi", sinif: "bg-altin/10 text-altin" },
  kapali: { etiket: "Kapalı", sinif: "bg-green-50 text-green-700" },
  itilafli: { etiket: "İtilaflı", sinif: "bg-red-50 text-red-700" },
};

const girdiSinif =
  "rounded-md border border-cizgi bg-white px-2.5 py-1.5 text-sm focus:border-murekkep-2 focus:outline-none";

function para(t: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(t);
}

function tarih(t: string) {
  return new Date(t).toLocaleDateString("tr-TR");
}

export function FaturaSatiri({ fatura }: { fatura: Fatura }) {
  const [duzenle, setDuzenle] = useState(false);
  const [silOnay, setSilOnay] = useState(false);
  const [guncelleDurum, guncelleEylem, guncelleniyor] = useActionState(
    faturaGuncelle,
    bos
  );
  const [silDurum, silEylem, siliniyor] = useActionState(faturaSil, bos);

  // Başarılı güncellemede düzenleme modundan çık (render sırasında türetme).
  const [sonMesaj, setSonMesaj] = useState<string | undefined>(undefined);
  if (guncelleDurum.mesaj !== sonMesaj) {
    setSonMesaj(guncelleDurum.mesaj);
    if (guncelleDurum.mesaj) setDuzenle(false);
  }

  if (duzenle) {
    return (
      <tr className="border-b border-cizgi bg-kart">
        <td colSpan={7} className="px-4 py-3">
          <form action={guncelleEylem} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="id" value={fatura.id} />
            <span className="self-center text-sm text-murekkep-2">
              {fatura.musteri_unvan}
            </span>
            <input
              name="fatura_no"
              required
              defaultValue={fatura.fatura_no}
              placeholder="Fatura no *"
              className={girdiSinif}
            />
            <input
              name="fatura_tarihi"
              type="date"
              required
              defaultValue={fatura.fatura_tarihi}
              title="Fatura tarihi"
              className={girdiSinif}
            />
            <input
              name="vade_tarihi"
              type="date"
              required
              defaultValue={fatura.vade_tarihi}
              title="Vade tarihi"
              className={girdiSinif}
            />
            <input
              name="tutar"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={fatura.tutar}
              placeholder="Tutar *"
              className={`${girdiSinif} w-32`}
            />
            <button
              type="submit"
              disabled={guncelleniyor}
              className="rounded-md bg-murekkep px-3 py-1.5 text-sm font-medium text-kagit hover:bg-[#123a33] disabled:opacity-50"
            >
              {guncelleniyor ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setDuzenle(false)}
              className="px-2 py-1.5 text-sm text-murekkep-2 hover:text-murekkep"
            >
              Vazgeç
            </button>
            {guncelleDurum.hata && (
              <span className="w-full text-sm text-gecikme">
                {guncelleDurum.hata}
              </span>
            )}
          </form>
        </td>
      </tr>
    );
  }

  const durumBilgi = DURUM[fatura.durum] ?? DURUM.acik;
  const bugun = new Date().toISOString().slice(0, 10);
  const gecikti =
    fatura.vade_tarihi < bugun &&
    (fatura.durum === "acik" || fatura.durum === "kismi");

  return (
    <tr className="border-b border-cizgi">
      <td className="px-4 py-3 font-medium text-murekkep">
        {fatura.fatura_no}
      </td>
      <td className="px-4 py-3 text-murekkep-2">{fatura.musteri_unvan}</td>
      <td
        className={`px-4 py-3 ${gecikti ? "font-medium text-gecikme" : "text-murekkep-2"}`}
      >
        {tarih(fatura.vade_tarihi)}
        {gecikti && " ⚠"}
      </td>
      <td className="px-4 py-3 text-murekkep-2">{para(Number(fatura.tutar))}</td>
      <td className="px-4 py-3 text-murekkep-2">
        {para(Number(fatura.kalan_bakiye))}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${durumBilgi.sinif}`}
        >
          {durumBilgi.etiket}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {silOnay ? (
          <form action={silEylem} className="inline-flex items-center gap-2">
            <input type="hidden" name="id" value={fatura.id} />
            <span className="text-xs text-murekkep-2">Emin misiniz?</span>
            <button
              type="submit"
              disabled={siliniyor}
              className="text-sm font-medium text-gecikme hover:underline disabled:opacity-50"
            >
              {siliniyor ? "Siliniyor…" : "Evet, sil"}
            </button>
            <button
              type="button"
              onClick={() => setSilOnay(false)}
              className="text-sm text-murekkep-2 hover:text-murekkep"
            >
              Vazgeç
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setDuzenle(true)}
              className="text-sm text-murekkep-2 hover:text-murekkep hover:underline"
            >
              Düzenle
            </button>
            <button
              type="button"
              onClick={() => setSilOnay(true)}
              className="text-sm text-gecikme hover:underline"
            >
              Sil
            </button>
          </div>
        )}
        {silDurum.hata && (
          <p className="mt-1 text-xs text-gecikme">{silDurum.hata}</p>
        )}
      </td>
    </tr>
  );
}
