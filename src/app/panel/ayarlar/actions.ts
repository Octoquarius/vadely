"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type IslemDurum = { hata?: string; mesaj?: string };

export async function hesapSil(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  if (String(formData.get("onay") ?? "") !== "SIL") {
    return { hata: 'Onay için "SIL" yazmalısınız.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("hesabimi_sil");
  if (error) {
    return { hata: error.message || "Hesap silinemedi." };
  }

  await supabase.auth.signOut();
  redirect("/");
}

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
