"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  baytlariCoz,
  csvAyristir,
  sayiAyristir,
  tarihAyristir,
  type CsvTablo,
} from "@/lib/csv";
import {
  ekstreOdemeleriIceAktar,
  type EkstreSatir,
  type EkstreSonuc,
} from "../actions";

const ALANLAR = [
  { anahtar: "tarih", etiket: "Transaction date", zorunlu: true },
  { anahtar: "tutar", etiket: "Amount", zorunlu: true },
  { anahtar: "aciklama", etiket: "Description", zorunlu: false },
] as const;

type Alan = (typeof ALANLAR)[number]["anahtar"];

const IPUCLARI: Record<Alan, string[]> = {
  tarih: ["tarih", "valor", "date"],
  tutar: ["tutar", "meblag", "alacak", "amount", "islem tutar"],
  aciklama: ["aciklama", "description", "detay", "islem"],
};

function normallestir(baslik: string): string {
  return baslik
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function tahminEt(basliklar: string[]): Partial<Record<Alan, number>> {
  const normaller = basliklar.map(normallestir);
  const sonuc: Partial<Record<Alan, number>> = {};
  const kullanilan = new Set<number>();
  for (const alan of ALANLAR) {
    for (const ipucu of IPUCLARI[alan.anahtar]) {
      const indeks = normaller.findIndex(
        (b, i) => !kullanilan.has(i) && b.includes(ipucu)
      );
      if (indeks !== -1) {
        sonuc[alan.anahtar] = indeks;
        kullanilan.add(indeks);
        break;
      }
    }
  }
  return sonuc;
}

export function EkstreForm() {
  const [tablo, setTablo] = useState<CsvTablo | null>(null);
  const [eslesme, setEslesme] = useState<Partial<Record<Alan, number>>>({});
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [sonuc, setSonuc] = useState<EkstreSonuc | null>(null);
  const [dosyaHatasi, setDosyaHatasi] = useState<string | null>(null);

  async function dosyaSecildi(dosya: File | undefined) {
    setDosyaHatasi(null);
    setSonuc(null);
    if (!dosya) return;
    const metin = baytlariCoz(await dosya.arrayBuffer());
    const ayrisan = csvAyristir(metin);
    if (ayrisan.basliklar.length < 2 || ayrisan.satirlar.length === 0) {
      setDosyaHatasi(
        "The file could not be read or has no data rows. The first row must be column headers."
      );
      return;
    }
    setTablo(ayrisan);
    setEslesme(tahminEt(ayrisan.basliklar));
  }

  const dogrulama = useMemo(() => {
    if (!tablo || eslesme.tarih === undefined || eslesme.tutar === undefined) {
      return null;
    }
    const gecerliler: EkstreSatir[] = [];
    let hatali = 0;
    let gidenVeyaSifir = 0;

    for (const satir of tablo.satirlar) {
      const tarih = tarihAyristir((satir[eslesme.tarih] ?? "").trim());
      const tutar = sayiAyristir((satir[eslesme.tutar] ?? "").trim());
      const aciklama =
        eslesme.aciklama !== undefined
          ? (satir[eslesme.aciklama] ?? "").trim() || null
          : null;

      if (tarih === null || tutar === null) {
        hatali++;
      } else if (tutar <= 0) {
        gidenVeyaSifir++; // outgoing (negative) transactions are not included in receivables tracking
      } else {
        gecerliler.push({ odeme_tarihi: tarih, tutar, aciklama });
      }
    }
    return { gecerliler, hatali, gidenVeyaSifir };
  }, [tablo, eslesme]);

  async function aktar() {
    if (!dogrulama || dogrulama.gecerliler.length === 0) return;
    setGonderiliyor(true);
    try {
      setSonuc(await ekstreOdemeleriIceAktar(dogrulama.gecerliler));
    } finally {
      setGonderiliyor(false);
    }
  }

  if (sonuc && !sonuc.hata) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Statement imported: <strong>{sonuc.eklenen}</strong> payments added,{" "}
          <strong>{sonuc.mukerrer}</strong> duplicate rows skipped.
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          Now match the payments with open invoices.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/panel/odemeler"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Back to payments
          </Link>
          <button
            onClick={() => {
              setTablo(null);
              setSonuc(null);
            }}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Upload new statement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-zinc-900">
          Select statement file (CSV)
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Download your account transactions as CSV from your online banking.
          Only <strong>incoming</strong> (positive) amounts are imported as
          payments; outgoing transactions are skipped.
        </p>
        <input
          type="file"
          accept=".csv,.txt,text/csv"
          onChange={(e) => dosyaSecildi(e.target.files?.[0])}
          className="mt-4 block text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700"
        />
        {dosyaHatasi && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {dosyaHatasi}
          </p>
        )}
      </div>

      {tablo && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">
            Map the columns
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {ALANLAR.map((alan) => (
              <label
                key={alan.anahtar}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-zinc-700">
                  {alan.etiket}
                  {alan.zorunlu && <span className="text-red-500"> *</span>}
                </span>
                <select
                  value={eslesme[alan.anahtar] ?? ""}
                  onChange={(e) =>
                    setEslesme((onceki) => {
                      const yeni = { ...onceki };
                      if (e.target.value === "") delete yeni[alan.anahtar];
                      else yeni[alan.anahtar] = Number(e.target.value);
                      return yeni;
                    })
                  }
                  className="w-44 rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">— No mapping —</option>
                  {tablo.basliklar.map((baslik, i) => (
                    <option key={i} value={i}>
                      {baslik || `Column ${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {dogrulama && (
            <>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
                  {dogrulama.gecerliler.length} incoming payments
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-600">
                  {dogrulama.gidenVeyaSifir} outgoing/zero transactions (skipped)
                </span>
                <span
                  className={`rounded-full px-3 py-1 font-medium ${
                    dogrulama.hatali > 0
                      ? "bg-red-50 text-red-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {dogrulama.hatali} unreadable rows
                </span>
              </div>

              {sonuc?.hata && (
                <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {sonuc.hata}
                </p>
              )}

              <button
                onClick={aktar}
                disabled={gonderiliyor || dogrulama.gecerliler.length === 0}
                className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {gonderiliyor
                  ? "Importing…"
                  : `Import ${dogrulama.gecerliler.length} payments`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
