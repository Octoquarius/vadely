"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IslemDurum = { hata?: string; mesaj?: string };

const GECERLI_PAKETLER = ["baslangic", "profesyonel", "isletme"];

export async function paketSec(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const paket = String(formData.get("paket") ?? "");
  const donem = String(formData.get("donem") ?? "aylik");

  if (!GECERLI_PAKETLER.includes(paket)) return { hata: "Geçersiz paket." };
  if (!["aylik", "yillik"].includes(donem)) return { hata: "Geçersiz dönem." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hesaplar")
    .update({ paket, paket_donemi: donem })
    .select("id");

  if (error || !data || data.length === 0) {
    return {
      hata: "Paket seçilemedi. Bu işlemi yalnızca hesap sahibi yapabilir.",
    };
  }

  revalidatePath("/panel", "layout");
  return {
    mesaj:
      "Paket tercihiniz kaydedildi. Ödeme adımı, yayına geçişle birlikte e-postayla iletilecek.",
  };
}
