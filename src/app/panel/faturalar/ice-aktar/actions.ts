"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IceAktarSatir = {
  musteri_unvan: string;
  fatura_no: string;
  fatura_tarihi: string; // ISO yyyy-aa-gg
  vade_tarihi: string; // ISO yyyy-aa-gg
  tutar: number;
  vkn?: string | null;
  eposta?: string | null;
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

export async function faturalariIceAktar(
  satirlar: IceAktarSatir[]
): Promise<IceAktarSonuc> {
  const bos: IceAktarSonuc = { eklenen: 0, mukerrer: 0, yeniMusteri: 0 };

  if (!Array.isArray(satirlar) || satirlar.length === 0) {
    return { ...bos, hata: "Aktarılacak satır bulunamadı." };
  }
  if (satirlar.length > AZAMI_SATIR) {
    return {
      ...bos,
      hata: `Tek seferde en fazla ${AZAMI_SATIR} satır aktarılabilir.`,
    };
  }

  // Sunucu tarafı yeniden doğrulama: istemciden gelen veriye güvenme
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
      satir.tutar > 0;
    if (!gecerli) {
      return {
        ...bos,
        hata: `Geçersiz satır: "${String(satir.fatura_no ?? "?")}". Sayfayı yenileyip tekrar deneyin.`,
      };
    }
  }

  const supabase = await createClient();

  // Dosya içi mükerrer fatura no'ları ele (ilki kalır)
  const gorulenNolar = new Set<string>();
  const tekilSatirlar: IceAktarSatir[] = [];
  let dosyaIciMukerrer = 0;
  for (const satir of satirlar) {
    const no = satir.fatura_no.trim();
    if (gorulenNolar.has(no)) {
      dosyaIciMukerrer++;
    } else {
      gorulenNolar.add(no);
      tekilSatirlar.push(satir);
    }
  }

  // Mevcut cariler: unvana göre eşle (RLS yalnızca kendi tenant'ını döndürür)
  const { data: mevcutMusteriler, error: musteriHata } = await supabase
    .from("musteriler")
    .select("id, unvan");
  if (musteriHata) {
    return { ...bos, hata: "Müşteri listesi okunamadı. Tekrar deneyin." };
  }

  const musteriHaritasi = new Map<string, string>();
  for (const musteri of mevcutMusteriler ?? []) {
    musteriHaritasi.set(unvanAnahtari(musteri.unvan), musteri.id);
  }

  // Eksik carileri oluştur (dosya içinde tekilleştirilmiş)
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
        hata: "Yeni müşteriler oluşturulamadı. Yetkinizi kontrol edin (salt-okur rol içe aktaramaz).",
      };
    }
    for (const musteri of eklenenMusteriler ?? []) {
      musteriHaritasi.set(unvanAnahtari(musteri.unvan), musteri.id);
    }
  }

  // Veritabanında zaten var olan fatura no'ları bul (mükerrer atlama)
  const tumNolar = tekilSatirlar.map((s) => s.fatura_no.trim());
  const mevcutNolar = new Set<string>();
  for (let i = 0; i < tumNolar.length; i += 500) {
    const { data: parcaVeri, error: parcaHata } = await supabase
      .from("faturalar")
      .select("fatura_no")
      .in("fatura_no", tumNolar.slice(i, i + 500));
    if (parcaHata) {
      return { ...bos, hata: "Mevcut faturalar kontrol edilemedi. Tekrar deneyin." };
    }
    for (const fatura of parcaVeri ?? []) mevcutNolar.add(fatura.fatura_no);
  }

  const eklenecekler = tekilSatirlar
    .filter((satir) => !mevcutNolar.has(satir.fatura_no.trim()))
    .map((satir) => ({
      musteri_id: musteriHaritasi.get(unvanAnahtari(satir.musteri_unvan))!,
      fatura_no: satir.fatura_no.trim(),
      fatura_tarihi: satir.fatura_tarihi,
      vade_tarihi: satir.vade_tarihi,
      tutar: satir.tutar,
      kalan_bakiye: satir.tutar,
      kaynak: "csv" as const,
    }));

  let eklenen = 0;
  for (let i = 0; i < eklenecekler.length; i += 500) {
    const parca = eklenecekler.slice(i, i + 500);
    const { error: faturaHata } = await supabase.from("faturalar").insert(parca);
    if (faturaHata) {
      return {
        eklenen,
        mukerrer: dosyaIciMukerrer + mevcutNolar.size,
        yeniMusteri: yeniMusteriKayitlari.size,
        hata: `Faturaların bir kısmı eklenemedi (${eklenen}/${eklenecekler.length} eklendi). Tekrar deneyin.`,
      };
    }
    eklenen += parca.length;
  }

  revalidatePath("/panel/faturalar");
  revalidatePath("/panel");

  return {
    eklenen,
    mukerrer: dosyaIciMukerrer + mevcutNolar.size,
    yeniMusteri: yeniMusteriKayitlari.size,
  };
}
