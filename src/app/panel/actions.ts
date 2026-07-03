"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IslemDurum = { hata?: string };

export async function musteriEkle(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const unvan = String(formData.get("unvan") ?? "").trim();
  if (!unvan) return { hata: "Unvan zorunludur." };

  const { error } = await supabase.from("musteriler").insert({
    unvan,
    vkn: String(formData.get("vkn") ?? "").trim() || null,
    eposta: String(formData.get("eposta") ?? "").trim() || null,
    telefon: String(formData.get("telefon") ?? "").trim() || null,
  });

  if (error) return { hata: "Müşteri eklenemedi. Yetkinizi kontrol edin." };

  revalidatePath("/panel/musteriler");
  return {};
}

export async function musteriSil(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (id) {
    // Faturası olan müşteri FK (restrict) nedeniyle silinemez; sessizce yoksayılır.
    await supabase.from("musteriler").delete().eq("id", id);
    revalidatePath("/panel/musteriler");
  }
}

export async function faturaEkle(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const musteriId = String(formData.get("musteri_id") ?? "");
  const faturaNo = String(formData.get("fatura_no") ?? "").trim();
  const faturaTarihi = String(formData.get("fatura_tarihi") ?? "");
  const vadeTarihi = String(formData.get("vade_tarihi") ?? "");
  const tutar = Number(formData.get("tutar"));

  if (!musteriId || !faturaNo || !faturaTarihi || !vadeTarihi) {
    return { hata: "Tüm zorunlu alanları doldurun." };
  }
  if (!Number.isFinite(tutar) || tutar <= 0) {
    return { hata: "Tutar sıfırdan büyük olmalı." };
  }
  if (vadeTarihi < faturaTarihi) {
    return { hata: "Vade tarihi fatura tarihinden önce olamaz." };
  }

  const { error } = await supabase.from("faturalar").insert({
    musteri_id: musteriId,
    fatura_no: faturaNo,
    fatura_tarihi: faturaTarihi,
    vade_tarihi: vadeTarihi,
    tutar,
    kalan_bakiye: tutar,
    kaynak: "manuel",
  });

  if (error) {
    if (error.code === "23505") {
      return { hata: "Bu fatura numarası zaten kayıtlı." };
    }
    return { hata: "Fatura eklenemedi. Yetkinizi kontrol edin." };
  }

  revalidatePath("/panel/faturalar");
  revalidatePath("/panel");
  return {};
}

export async function faturaSil(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await supabase.from("faturalar").delete().eq("id", id);
    revalidatePath("/panel/faturalar");
    revalidatePath("/panel");
  }
}
