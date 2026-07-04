"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IslemDurum = { hata?: string; mesaj?: string };

export async function ayarKaydet(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const ad = String(formData.get("ad") ?? "").trim();
  const gonderimModu = String(formData.get("gonderim_modu") ?? "onayli");

  if (!ad) return { hata: "Şirket adı boş olamaz." };
  if (!["onayli", "otomatik"].includes(gonderimModu)) {
    return { hata: "Geçersiz gönderim modu." };
  }

  const { data, error } = await supabase
    .from("hesaplar")
    .update({ ad, gonderim_modu: gonderimModu })
    .select("id");

  if (error || !data || data.length === 0) {
    return {
      hata: "Ayarlar kaydedilemedi. Bu işlemi yalnızca hesap sahibi yapabilir.",
    };
  }

  revalidatePath("/panel", "layout");
  return { mesaj: "Ayarlar kaydedildi." };
}
