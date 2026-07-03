"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IslemDurum = { hata?: string; mesaj?: string };

export async function planUret(
  _onceki: IslemDurum,
  _formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("hatirlatma_plani_uret_benim");
  if (error) {
    return { hata: "Plan üretilemedi. Tekrar deneyin." };
  }

  revalidatePath("/panel/hatirlatmalar");
  const adet = Number(data ?? 0);
  return {
    mesaj:
      adet > 0
        ? `${adet} yeni hatırlatma planlandı.`
        : "Planlanacak yeni hatırlatma yok (her şey güncel).",
  };
}

export async function hatirlatmaIptal(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase
    .from("hatirlatmalar")
    .update({ durum: "iptal" })
    .eq("id", id)
    .eq("durum", "planlandi"); // yalnızca henüz gönderilmemişler iptal edilebilir

  revalidatePath("/panel/hatirlatmalar");
}

export async function kadansEkle(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const gunFarki = Number(formData.get("gun_farki"));
  const sablonKodu = String(formData.get("sablon_kodu") ?? "");

  if (!Number.isInteger(gunFarki) || gunFarki < -60 || gunFarki > 365) {
    return { hata: "Gün farkı -60 ile 365 arasında bir tam sayı olmalı." };
  }

  const { error } = await supabase.from("kadans_adimlari").insert({
    gun_farki: gunFarki,
    sablon_kodu: sablonKodu,
    kanal: "eposta",
  });

  if (error) {
    if (error.code === "23505") {
      return { hata: "Bu gün farkı için zaten bir adım var." };
    }
    return { hata: "Adım eklenemedi. Yetkinizi kontrol edin." };
  }

  revalidatePath("/panel/hatirlatmalar/kadans");
  return {};
}

export async function kadansAktifDegistir(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const yeniDurum = String(formData.get("aktif") ?? "") === "true";
  if (!id) return;

  await supabase
    .from("kadans_adimlari")
    .update({ aktif: yeniDurum })
    .eq("id", id);

  revalidatePath("/panel/hatirlatmalar/kadans");
}

export async function kadansSil(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("kadans_adimlari").delete().eq("id", id);
  revalidatePath("/panel/hatirlatmalar/kadans");
}
