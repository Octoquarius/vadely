"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IceAktarSatir = {
  musteri_unvan: string;
  fatura_no: string;
  fatura_tarihi: string; // ISO yyyy-mm-dd
  vade_tarihi: string; // ISO yyyy-mm-dd
  tutar: number;
  vkn?: string | null;
  eposta?: string | null;
  gib_uuid?: string | null;
  para_birimi?: string | null;
};

export type IceAktarSonuc = {
  hata?: string;
  eklenen: number;
  mukerrer: number;
  yeniMusteri: number;
};

const AZAMI_SATIR = 2000;
const ISO_TARIH = /^\d{4}-\d{2}-\d{2}$/;

function unvanAnahtari(unvan: string): string {
  return unvan.trim().toLocaleLowerCase("tr-TR");
}

/** Imports rows coming from the CSV wizard. */
export async function faturalariIceAktar(
  satirlar: IceAktarSatir[]
): Promise<IceAktarSonuc> {
  return cekirdekIceAktar(satirlar, "csv");
}

/** Imports rows coming from UBL XML (e-Fatura/e-Arşiv) files. */
export async function gibFaturalariIceAktar(
  satirlar: IceAktarSatir[]
): Promise<IceAktarSonuc> {
  return cekirdekIceAktar(satirlar, "gib");
}

async function cekirdekIceAktar(
  satirlar: IceAktarSatir[],
  kaynak: "csv" | "gib"
): Promise<IceAktarSonuc> {
  const bos: IceAktarSonuc = { eklenen: 0, mukerrer: 0, yeniMusteri: 0 };

  if (!Array.isArray(satirlar) || satirlar.length === 0) {
    return { ...bos, hata: "No rows found to import." };
  }
  if (satirlar.length > AZAMI_SATIR) {
    return {
      ...bos,
      hata: `A maximum of ${AZAMI_SATIR} rows can be imported at once.`,
    };
  }

  // Server-side re-validation: don't trust data coming from the client
  for (const satir of satirlar) {
    const gecerli =
      typeof satir.musteri_unvan === "string" &&
      satir.musteri_unvan.trim().length > 0 &&
      satir.musteri_unvan.length <= 300 &&
      typeof satir.fatura_no === "string" &&
      satir.fatura_no.trim().length > 0 &&
      satir.fatura_no.length <= 100 &&
      ISO_TARIH.test(satir.fatura_tarihi) &&
      ISO_TARIH.test(satir.vade_tarihi) &&
      satir.vade_tarihi >= satir.fatura_tarihi &&
      typeof satir.tutar === "number" &&
      Number.isFinite(satir.tutar) &&
      satir.tutar > 0 &&
      (satir.gib_uuid == null || String(satir.gib_uuid).length <= 100) &&
      (satir.para_birimi == null || /^[A-Z]{3}$/.test(satir.para_birimi));
    if (!gecerli) {
      return {
        ...bos,
        hata: `Invalid row: "${String(satir.fatura_no ?? "?")}". Refresh the page and try again.`,
      };
    }
  }

  const supabase = await createClient();

  // Handle duplicates within the file (invoice no or GİB UUID; the first one wins)
  const gorulenNolar = new Set<string>();
  const gorulenUuidler = new Set<string>();
  const tekilSatirlar: IceAktarSatir[] = [];
  let dosyaIciMukerrer = 0;
  for (const satir of satirlar) {
    const no = satir.fatura_no.trim();
    const uuid = satir.gib_uuid?.trim() || null;
    if (gorulenNolar.has(no) || (uuid && gorulenUuidler.has(uuid))) {
      dosyaIciMukerrer++;
    } else {
      gorulenNolar.add(no);
      if (uuid) gorulenUuidler.add(uuid);
      tekilSatirlar.push(satir);
    }
  }

  // Existing customers: match by name (RLS only returns the current tenant's own rows)
  const { data: mevcutMusteriler, error: musteriHata } = await supabase
    .from("musteriler")
    .select("id, unvan");
  if (musteriHata) {
    return { ...bos, hata: "Could not read the customer list. Try again." };
  }

  const musteriHaritasi = new Map<string, string>();
  for (const musteri of mevcutMusteriler ?? []) {
    musteriHaritasi.set(unvanAnahtari(musteri.unvan), musteri.id);
  }

  // Create missing customers (deduplicated within the file)
  const yeniMusteriKayitlari = new Map<
    string,
    { unvan: string; vkn: string | null; eposta: string | null }
  >();
  for (const satir of tekilSatirlar) {
    const anahtar = unvanAnahtari(satir.musteri_unvan);
    if (!musteriHaritasi.has(anahtar) && !yeniMusteriKayitlari.has(anahtar)) {
      yeniMusteriKayitlari.set(anahtar, {
        unvan: satir.musteri_unvan.trim(),
        vkn: satir.vkn?.trim() || null,
        eposta: satir.eposta?.trim() || null,
      });
    }
  }

  if (yeniMusteriKayitlari.size > 0) {
    const { data: eklenenMusteriler, error: ekleHata } = await supabase
      .from("musteriler")
      .insert([...yeniMusteriKayitlari.values()])
      .select("id, unvan");
    if (ekleHata) {
      return {
        ...bos,
        hata: "Could not create new customers. Check your permissions (a read-only role cannot import).",
      };
    }
    for (const musteri of eklenenMusteriler ?? []) {
      musteriHaritasi.set(unvanAnahtari(musteri.unvan), musteri.id);
    }
  }

  // Find records that already exist in the database: invoice no + GİB UUID
  const tumNolar = tekilSatirlar.map((s) => s.fatura_no.trim());
  const mevcutNolar = new Set<string>();
  for (let i = 0; i < tumNolar.length; i += 500) {
    const { data: parcaVeri, error: parcaHata } = await supabase
      .from("faturalar")
      .select("fatura_no")
      .in("fatura_no", tumNolar.slice(i, i + 500));
    if (parcaHata) {
      return { ...bos, hata: "Could not check existing invoices. Try again." };
    }
    for (const fatura of parcaVeri ?? []) mevcutNolar.add(fatura.fatura_no);
  }

  const tumUuidler = [...gorulenUuidler];
  const mevcutUuidler = new Set<string>();
  for (let i = 0; i < tumUuidler.length; i += 500) {
    const { data: parcaVeri, error: parcaHata } = await supabase
      .from("faturalar")
      .select("gib_uuid")
      .in("gib_uuid", tumUuidler.slice(i, i + 500));
    if (parcaHata) {
      return { ...bos, hata: "Could not check existing invoices. Try again." };
    }
    for (const fatura of parcaVeri ?? []) {
      if (fatura.gib_uuid) mevcutUuidler.add(fatura.gib_uuid);
    }
  }

  const eklenecekler = tekilSatirlar
    .filter(
      (satir) =>
        !mevcutNolar.has(satir.fatura_no.trim()) &&
        !(satir.gib_uuid && mevcutUuidler.has(satir.gib_uuid.trim()))
    )
    .map((satir) => ({
      musteri_id: musteriHaritasi.get(unvanAnahtari(satir.musteri_unvan))!,
      fatura_no: satir.fatura_no.trim(),
      fatura_tarihi: satir.fatura_tarihi,
      vade_tarihi: satir.vade_tarihi,
      tutar: satir.tutar,
      kalan_bakiye: satir.tutar,
      para_birimi: satir.para_birimi ?? "TRY",
      gib_uuid: satir.gib_uuid?.trim() || null,
      kaynak,
    }));

  const veritabaniMukerrer = tekilSatirlar.length - eklenecekler.length;

  let eklenen = 0;
  for (let i = 0; i < eklenecekler.length; i += 500) {
    const parca = eklenecekler.slice(i, i + 500);
    const { error: faturaHata } = await supabase.from("faturalar").insert(parca);
    if (faturaHata) {
      return {
        eklenen,
        mukerrer: dosyaIciMukerrer + veritabaniMukerrer,
        yeniMusteri: yeniMusteriKayitlari.size,
        hata: `Some invoices could not be added (${eklenen}/${eklenecekler.length} added). Try again.`,
      };
    }
    eklenen += parca.length;
  }

  revalidatePath("/panel/faturalar");
  revalidatePath("/panel");

  return {
    eklenen,
    mukerrer: dosyaIciMukerrer + veritabaniMukerrer,
    yeniMusteri: yeniMusteriKayitlari.size,
  };
}
