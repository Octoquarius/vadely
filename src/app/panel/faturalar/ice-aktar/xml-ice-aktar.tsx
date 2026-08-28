"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { baytlariCoz } from "@/lib/csv";
import { ublFaturaAyristir, type UblFatura } from "@/lib/ubl";
import {
  gibFaturalariIceAktar,
  type IceAktarSatir,
  type IceAktarSonuc,
} from "./actions";

type DosyaSonucu =
  | { tamam: true; dosyaAdi: string; fatura: UblFatura }
  | { tamam: false; dosyaAdi: string; hata: string };

function paraFormat(tutar: number, paraBirimi: string) {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: paraBirimi,
    }).format(tutar);
  } catch {
    return `${tutar} ${paraBirimi}`;
  }
}

export function XmlIceAktar() {
  const [sonuclar, setSonuclar] = useState<DosyaSonucu[]>([]);
  const [vadeGunu, setVadeGunu] = useState(30);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [aktarim, setAktarim] = useState<IceAktarSonuc | null>(null);

  async function dosyalarSecildi(dosyalar: FileList | null) {
    if (!dosyalar || dosyalar.length === 0) return;
    setAktarim(null);

    const yeniSonuclar: DosyaSonucu[] = [];
    for (const dosya of Array.from(dosyalar)) {
      if (/\.zip$/i.test(dosya.name)) {
        yeniSonuclar.push({
          tamam: false,
          dosyaAdi: dosya.name,
          hata: "ZIP archives are not supported; extract the XML files inside and select those.",
        });
        continue;
      }
      try {
        const metin = baytlariCoz(await dosya.arrayBuffer());
        const belge = new DOMParser().parseFromString(metin, "text/xml");
        const ayrisan = ublFaturaAyristir(belge, dosya.name);
        if (ayrisan.tamam) {
          yeniSonuclar.push({
            tamam: true,
            dosyaAdi: dosya.name,
            fatura: ayrisan.fatura,
          });
        } else {
          yeniSonuclar.push({
            tamam: false,
            dosyaAdi: dosya.name,
            hata: ayrisan.hata,
          });
        }
      } catch {
        yeniSonuclar.push({
          tamam: false,
          dosyaAdi: dosya.name,
          hata: `${dosya.name}: the file could not be read.`,
        });
      }
    }
    setSonuclar(yeniSonuclar);
  }

  const gecerliler = useMemo(
    () => sonuclar.filter((s): s is Extract<DosyaSonucu, { tamam: true }> => s.tamam),
    [sonuclar]
  );
  const hatalilar = useMemo(
    () => sonuclar.filter((s): s is Extract<DosyaSonucu, { tamam: false }> => !s.tamam),
    [sonuclar]
  );
  const vadesizSayisi = gecerliler.filter(
    (s) => s.fatura.vade_tarihi === null
  ).length;

  async function aktar() {
    if (gecerliler.length === 0) return;
    setGonderiliyor(true);
    try {
      const satirlar: IceAktarSatir[] = gecerliler.map(({ fatura }) => {
        let vade = fatura.vade_tarihi;
        if (!vade) {
          const tarih = new Date(`${fatura.fatura_tarihi}T00:00:00Z`);
          tarih.setUTCDate(tarih.getUTCDate() + vadeGunu);
          vade = tarih.toISOString().slice(0, 10);
        }
        return {
          musteri_unvan: fatura.musteri_unvan,
          fatura_no: fatura.fatura_no,
          fatura_tarihi: fatura.fatura_tarihi,
          vade_tarihi: vade,
          tutar: fatura.tutar,
          vkn: fatura.vkn,
          eposta: fatura.eposta,
          gib_uuid: fatura.gib_uuid,
          para_birimi: fatura.para_birimi,
        };
      });
      const cevap = await gibFaturalariIceAktar(satirlar);
      setAktarim(cevap);
    } finally {
      setGonderiliyor(false);
    }
  }

  // Result screen once the import completes
  if (aktarim) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-zinc-900">
          Import result
        </h2>
        {aktarim.hata ? (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {aktarim.hata}
          </p>
        ) : (
          <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Import complete. 🎉
          </p>
        )}
        <ul className="mt-4 space-y-1 text-sm text-zinc-700">
          <li>
            ✅ Invoices added: <strong>{aktarim.eklenen}</strong>
          </li>
          <li>
            ⏭️ Skipped (already recorded / duplicate):{" "}
            <strong>{aktarim.mukerrer}</strong>
          </li>
          <li>
            👤 Customers created automatically:{" "}
            <strong>{aktarim.yeniMusteri}</strong>
          </li>
        </ul>
        <div className="mt-5 flex gap-3">
          <Link
            href="/panel/faturalar"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Back to invoices
          </Link>
          <button
            onClick={() => {
              setSonuclar([]);
              setAktarim(null);
            }}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Import new files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-zinc-900">
          Select e-Fatura / e-Arşiv XML files
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Select the UBL XML files for your <strong>outgoing (sales)</strong>{" "}
          invoices downloaded from your e-invoice integrator portal. You can
          select multiple files at once; customer details are read
          automatically from the invoice.
        </p>
        <input
          type="file"
          accept=".xml,text/xml"
          multiple
          onChange={(e) => dosyalarSecildi(e.target.files)}
          className="mt-4 block text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700"
        />
      </div>

      {sonuclar.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Preview</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
              {gecerliler.length} valid invoices
            </span>
            <span
              className={`rounded-full px-3 py-1 font-medium ${
                hatalilar.length > 0
                  ? "bg-red-50 text-red-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {hatalilar.length} files with errors (will be skipped)
            </span>
          </div>

          {hatalilar.length > 0 && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-red-100 bg-red-50/50 p-3 text-sm text-red-700">
              {hatalilar.map((hatali, i) => (
                <p key={i}>{hatali.hata}</p>
              ))}
            </div>
          )}

          {vadesizSayisi > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <span>
                {vadesizSayisi} invoices have no due date. Due date = invoice
                date +
              </span>
              <input
                type="number"
                min={0}
                max={365}
                value={vadeGunu}
                onChange={(e) => setVadeGunu(Number(e.target.value) || 0)}
                className="w-16 rounded-md border border-amber-300 bg-white px-2 py-1 text-sm"
              />
              <span>days.</span>
            </div>
          )}

          {gecerliler.length > 0 && (
            <div className="mt-3 overflow-x-auto rounded-md border border-zinc-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Invoice no</th>
                    <th className="px-3 py-2 font-medium">Customer</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Due date</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {gecerliler.slice(0, 10).map((sonuc, i) => (
                    <tr key={i} className="border-b border-zinc-100">
                      <td className="px-3 py-2 font-medium text-zinc-900">
                        {sonuc.fatura.fatura_no}
                      </td>
                      <td className="px-3 py-2">{sonuc.fatura.musteri_unvan}</td>
                      <td className="px-3 py-2">{sonuc.fatura.fatura_tarihi}</td>
                      <td className="px-3 py-2">
                        {sonuc.fatura.vade_tarihi ?? (
                          <span className="text-amber-600">+{vadeGunu} days</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {paraFormat(sonuc.fatura.tutar, sonuc.fatura.para_birimi)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {gecerliler.length > 10 && (
                <p className="px-3 py-2 text-sm text-zinc-500">
                  … and {gecerliler.length - 10} more invoices
                </p>
              )}
            </div>
          )}

          <button
            onClick={aktar}
            disabled={gonderiliyor || gecerliler.length === 0}
            className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {gonderiliyor
              ? "Importing…"
              : `Import ${gecerliler.length} invoices`}
          </button>
        </div>
      )}
    </div>
  );
}
