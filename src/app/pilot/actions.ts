"use server";

import { createClient } from "@/lib/supabase/server";

export type PilotDurum = { hata?: string; mesaj?: string };

const FATURA_ARALIKLARI = ["0-20", "20-100", "100-500", "500+"];

export async function pilotBasvur(
  _onceki: PilotDurum,
  formData: FormData
): Promise<PilotDurum> {
  const supabase = await createClient();

  const sirketAdi = String(formData.get("sirket_adi") ?? "").trim();
  const adSoyad = String(formData.get("ad_soyad") ?? "").trim();
  const eposta = String(formData.get("eposta") ?? "").trim();
  const araligi = String(formData.get("aylik_fatura_adedi") ?? "");

  if (!sirketAdi || !adSoyad || !eposta.includes("@")) {
    return { hata: "Şirket adı, ad soyad ve geçerli bir e-posta zorunludur." };
  }

  const { error } = await supabase.from("pilot_basvurulari").insert({
    sirket_adi: sirketAdi.slice(0, 200),
    ad_soyad: adSoyad.slice(0, 200),
    eposta: eposta.slice(0, 320),
    telefon: String(formData.get("telefon") ?? "").trim().slice(0, 40) || null,
    aylik_fatura_adedi: FATURA_ARALIKLARI.includes(araligi) ? araligi : null,
    kullanilan_yazilim:
      String(formData.get("kullanilan_yazilim") ?? "").trim().slice(0, 200) ||
      null,
    mesaj: String(formData.get("mesaj") ?? "").trim().slice(0, 2000) || null,
  });

  if (error) {
    return { hata: "Başvuru kaydedilemedi. Lütfen tekrar deneyin." };
  }

  return {
    mesaj:
      "Başvurunuz alındı! 2 iş günü içinde e-posta ile dönüş yapacağız.",
  };
}
