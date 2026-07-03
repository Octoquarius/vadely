"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  baytlariCoz,
  csvAyristir,
  kolonlariTahminEt,
  sayiAyristir,
  tarihAyristir,
  ESLENEBILIR_ALANLAR,
  type AlanAnahtari,
  type CsvTablo,
} from "@/lib/csv";
import {
  faturalariIceAktar,
  type IceAktarSatir,
  type IceAktarSonuc,
} from "./actions";

type Adim = "dosya" | "esleme" | "sonuc";

type SatirHatasi = { satirNo: number; sebep: string };

export function IceAktarSihirbazi() {
  const [adim, setAdim] = useState<Adim>("dosya");
  const [tablo, setTablo] = useState<CsvTablo | null>(null);
  const [eslesme, setEslesme] = useState<
    Partial<Record<AlanAnahtari, number>>
  >({});
  const [vadeGunu, setVadeGunu] = useState(30);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [sonuc, setSonuc] = useState<IceAktarSonuc | null>(null);
  const [dosyaHatasi, setDosyaHatasi] = useState<string | null>(null);

  async function dosyaSecildi(dosya: File | undefined) {
    setDosyaHatasi(null);
    if (!dosya) return;
    if (/\.(xlsx|xls)$/i.test(dosya.name)) {
      setDosyaHatasi(
        "Excel dosyaları henüz desteklenmiyor. Excel'de \"Farklı Kaydet → CSV\" ile kaydedip tekrar yükleyin."
      );
      return;
    }
    const metin = baytlariCoz(await dosya.arrayBuffer());
    const ayrisan = csvAyristir(metin);
    if (ayrisan.basliklar.length < 2 || ayrisan.satirlar.length === 0) {
      setDosyaHatasi(
        "Dosya okunamadı ya da veri satırı yok. İlk satır kolon başlıkları olmalı."
      );
      return;
    }
    setTablo(ayrisan);
    setEslesme(kolonlariTahminEt(ayrisan.basliklar));
    setAdim("esleme");
  }

  const dogrulama = useMemo(() => {
    if (!tablo) return null;

    const gecerliler: IceAktarSatir[] = [];
    const hatalar: SatirHatasi[] = [];
    const vadeVar = eslesme.vade_tarihi !== undefined;

    tablo.satirlar.forEach((satir, i) => {
      const satirNo = i + 2; // başlık 1. satır
      const oku = (alan: AlanAnahtari) =>
        eslesme[alan] !== undefined ? (satir[eslesme[alan]!] ?? "").trim() : "";

      const unvan = oku("musteri_unvan");
      const faturaNo = oku("fatura_no");
      const faturaTarihi = tarihAyristir(oku("fatura_tarihi"));
      const tutar = sayiAyristir(oku("tutar"));

      let vadeTarihi: string | null;
      if (vadeVar) {
        vadeTarihi = tarihAyristir(oku("vade_tarihi"));
      } else if (faturaTarihi) {
        const tarih = new Date(`${faturaTarihi}T00:00:00Z`);
        tarih.setUTCDate(tarih.getUTCDate() + vadeGunu);
        vadeTarihi = tarih.toISOString().slice(0, 10);
      } else {
        vadeTarihi = null;
      }

      const sebepler: string[] = [];
      if (!unvan) sebepler.push("müşteri unvanı boş");
      if (!faturaNo) sebepler.push("fatura no boş");
      if (!faturaTarihi) sebepler.push("fatura tarihi okunamadı");
      if (vadeVar && !vadeTarihi) sebepler.push("vade tarihi okunamadı");
      if (tutar === null || tutar <= 0) sebepler.push("tutar okunamadı");
      if (
        faturaTarihi &&
        vadeTarihi &&
        vadeTarihi < faturaTarihi
      )
        sebepler.push("vade, fatura tarihinden önce");

      if (sebepler.length > 0) {
        hatalar.push({ satirNo, sebep: sebepler.join(", ") });
      } else {
        gecerliler.push({
          musteri_unvan: unvan,
          fatura_no: faturaNo,
          fatura_tarihi: faturaTarihi!,
          vade_tarihi: vadeTarihi!,
          tutar: tutar!,
          vkn: oku("vkn") || null,
          eposta: oku("eposta") || null,
        });
      }
    });

    return { gecerliler, hatalar };
  }, [tablo, eslesme, vadeGunu]);

  const zorunluEksikler = ESLENEBILIR_ALANLAR.filter(
    (alan) => alan.zorunlu && eslesme[alan.anahtar] === undefined
  );

  async function aktar() {
    if (!dogrulama || dogrulama.gecerliler.length === 0) return;
    setGonderiliyor(true);
    try {
      const cevap = await faturalariIceAktar(dogrulama.gecerliler);
      setSonuc(cevap);
      setAdim("sonuc");
    } finally {
      setGonderiliyor(false);
    }
  }

  // ---- Adım 1: Dosya seçimi ----
  if (adim === "dosya") {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-zinc-900">
          1. CSV dosyanızı seçin
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          İlk satır kolon başlıkları olmalı. Noktalı virgül veya virgül
          ayraçlı dosyalar, &quot;1.234,56&quot; sayılar ve
          &quot;gg.aa.yyyy&quot; tarihler desteklenir. Excel kullanıyorsanız
          önce &quot;Farklı Kaydet → CSV&quot; deyin.
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
        <p className="mt-4 text-sm text-zinc-500">
          Elinizde hazır dosya yok mu?{" "}
          <a
            href="/fatura-import-sablonu.csv"
            download
            className="font-medium text-zinc-900 underline"
          >
            Örnek şablonu indirin
          </a>
          , doldurun ve buraya yükleyin.
        </p>
      </div>
    );
  }

  // ---- Adım 2: Kolon eşleme + önizleme ----
  if (adim === "esleme" && tablo && dogrulama) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">
            2. Kolonları eşleyin
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Başlıklardan otomatik tahmin edildi; gerekirse düzeltin.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {ESLENEBILIR_ALANLAR.map((alan) => (
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
                  className="w-48 rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">— Eşleme yok —</option>
                  {tablo.basliklar.map((baslik, i) => (
                    <option key={i} value={i}>
                      {baslik || `Kolon ${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {eslesme.vade_tarihi === undefined && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <span>Vade kolonu eşlenmedi. Vade = fatura tarihi +</span>
              <input
                type="number"
                min={0}
                max={365}
                value={vadeGunu}
                onChange={(e) => setVadeGunu(Number(e.target.value) || 0)}
                className="w-16 rounded-md border border-amber-300 bg-white px-2 py-1 text-sm"
              />
              <span>gün olarak hesaplanacak.</span>
            </div>
          )}

          {zorunluEksikler.length > 0 && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              Zorunlu alanlar eşlenmedi:{" "}
              {zorunluEksikler.map((alan) => alan.etiket).join(", ")}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">3. Önizleme</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
              {dogrulama.gecerliler.length} geçerli satır
            </span>
            <span
              className={`rounded-full px-3 py-1 font-medium ${
                dogrulama.hatalar.length > 0
                  ? "bg-red-50 text-red-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {dogrulama.hatalar.length} hatalı satır (atlanacak)
            </span>
          </div>

          {dogrulama.hatalar.length > 0 && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-red-100 bg-red-50/50 p-3 text-sm text-red-700">
              {dogrulama.hatalar.slice(0, 50).map((hata) => (
                <p key={hata.satirNo}>
                  Satır {hata.satirNo}: {hata.sebep}
                </p>
              ))}
              {dogrulama.hatalar.length > 50 && (
                <p className="mt-1 font-medium">
                  … ve {dogrulama.hatalar.length - 50} satır daha
                </p>
              )}
            </div>
          )}

          {dogrulama.gecerliler.length > 0 && (
            <div className="mt-3 overflow-x-auto rounded-md border border-zinc-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Müşteri</th>
                    <th className="px-3 py-2 font-medium">Fatura no</th>
                    <th className="px-3 py-2 font-medium">Tarih</th>
                    <th className="px-3 py-2 font-medium">Vade</th>
                    <th className="px-3 py-2 font-medium">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {dogrulama.gecerliler.slice(0, 5).map((satir, i) => (
                    <tr key={i} className="border-b border-zinc-100">
                      <td className="px-3 py-2">{satir.musteri_unvan}</td>
                      <td className="px-3 py-2">{satir.fatura_no}</td>
                      <td className="px-3 py-2">{satir.fatura_tarihi}</td>
                      <td className="px-3 py-2">{satir.vade_tarihi}</td>
                      <td className="px-3 py-2">
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        }).format(satir.tutar)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dogrulama.gecerliler.length > 5 && (
                <p className="px-3 py-2 text-sm text-zinc-500">
                  … ve {dogrulama.gecerliler.length - 5} satır daha
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={aktar}
              disabled={
                gonderiliyor ||
                zorunluEksikler.length > 0 ||
                dogrulama.gecerliler.length === 0
              }
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {gonderiliyor
                ? "Aktarılıyor…"
                : `${dogrulama.gecerliler.length} faturayı içe aktar`}
            </button>
            <button
              onClick={() => {
                setTablo(null);
                setEslesme({});
                setAdim("dosya");
              }}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Farklı dosya seç
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Adım 3: Sonuç ----
  if (adim === "sonuc" && sonuc) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-zinc-900">
          İçe aktarma sonucu
        </h2>
        {sonuc.hata ? (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {sonuc.hata}
          </p>
        ) : (
          <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            İçe aktarma tamamlandı. 🎉
          </p>
        )}
        <ul className="mt-4 space-y-1 text-sm text-zinc-700">
          <li>
            ✅ Eklenen fatura: <strong>{sonuc.eklenen}</strong>
          </li>
          <li>
            ⏭️ Atlanan (zaten kayıtlı / mükerrer):{" "}
            <strong>{sonuc.mukerrer}</strong>
          </li>
          <li>
            👤 Otomatik oluşturulan müşteri:{" "}
            <strong>{sonuc.yeniMusteri}</strong>
          </li>
        </ul>
        <div className="mt-5 flex gap-3">
          <Link
            href="/panel/faturalar"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Faturalara dön
          </Link>
          <button
            onClick={() => {
              setTablo(null);
              setEslesme({});
              setSonuc(null);
              setAdim("dosya");
            }}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Yeni dosya aktar
          </button>
        </div>
      </div>
    );
  }

  return null;
}
