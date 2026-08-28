"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type IslemDurum = { hata?: string; mesaj?: string };

export async function hesapSil(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  if (String(formData.get("onay") ?? "") !== "DELETE") {
    return { hata: 'You must type "DELETE" to confirm.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("hesabimi_sil");
  if (error) {
    return { hata: error.message || "Could not delete account." };
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

  if (!ad) return { hata: "Company name cannot be empty." };
  if (!["onayli", "otomatik"].includes(gonderimModu)) {
    return { hata: "Invalid sending mode." };
  }

  const { data, error } = await supabase
    .from("hesaplar")
    .update({ ad, gonderim_modu: gonderimModu })
    .select("id");

  if (error || !data || data.length === 0) {
    return {
      hata: "Could not save settings. Only the account owner can do this.",
    };
  }

  revalidatePath("/panel", "layout");
  return { mesaj: "Settings saved." };
}
