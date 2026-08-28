"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IslemDurum = { hata?: string; mesaj?: string };

const ISO_TARIH = /^\d{4}-\d{2}-\d{2}$/;

function sayfalariYenile(odemeId?: string) {
  revalidatePath("/panel/odemeler");
  if (odemeId) revalidatePath(`/panel/odemeler/${odemeId}`);
  revalidatePath("/panel/faturalar");
  revalidatePath("/panel");
}

export async function odemeEkle(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const tutar = Number(formData.get("tutar"));
  const odemeTarihi = String(formData.get("odeme_tarihi") ?? "");
  const musteriId = String(formData.get("musteri_id") ?? "");

  if (!Number.isFinite(tutar) || tutar <= 0) {
    return { hata: "Amount must be greater than zero." };
  }
  if (!ISO_TARIH.test(odemeTarihi)) {
    return { hata: "Select a valid payment date." };
  }

  const { error } = await supabase.from("odemeler").insert({
    tutar,
    odeme_tarihi: odemeTarihi,
    musteri_id: musteriId || null,
    aciklama: String(formData.get("aciklama") ?? "").trim() || null,
    kaynak: "manuel",
  });

  if (error) return { hata: "Payment could not be added. Check your permissions." };

  sayfalariYenile();
  return {};
}

export async function odemeSil(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // A payment that has matches cannot be deleted: matches must be removed
  // first, otherwise invoice balances would become inconsistent.
  const { count } = await supabase
    .from("fatura_odeme_eslesmeleri")
    .select("id", { count: "exact", head: true })
    .eq("odeme_id", id);

  if ((count ?? 0) === 0) {
    await supabase.from("odemeler").delete().eq("id", id);
    sayfalariYenile();
  }
}

export async function odemeEslestir(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const odemeId = String(formData.get("odeme_id") ?? "");
  const faturaId = String(formData.get("fatura_id") ?? "");
  const tutar = Number(formData.get("tutar"));

  if (!odemeId || !faturaId || !Number.isFinite(tutar) || tutar <= 0) {
    return { hata: "Enter a valid amount." };
  }

  const { error } = await supabase.rpc("odeme_eslestir", {
    p_odeme_id: odemeId,
    p_fatura_id: faturaId,
    p_tutar: tutar,
  });

  if (error) {
    // The raise exception messages from the database function are already user-facing
    return { hata: error.message || "Could not complete the match." };
  }

  sayfalariYenile(odemeId);
  return { mesaj: "Matched." };
}

export async function eslesmeKaldir(formData: FormData) {
  const supabase = await createClient();
  const eslesmeId = String(formData.get("eslesme_id") ?? "");
  const odemeId = String(formData.get("odeme_id") ?? "");
  if (!eslesmeId) return;

  await supabase.rpc("eslesme_kaldir", { p_eslesme_id: eslesmeId });
  sayfalariYenile(odemeId || undefined);
}

// ---- Bank statement import ----

export type EkstreSatir = {
  odeme_tarihi: string; // ISO
  tutar: number;
  aciklama: string | null;
};

export type EkstreSonuc = { hata?: string; eklenen: number; mukerrer: number };

const AZAMI_SATIR = 2000;

export async function ekstreOdemeleriIceAktar(
  satirlar: EkstreSatir[]
): Promise<EkstreSonuc> {
  const bos: EkstreSonuc = { eklenen: 0, mukerrer: 0 };

  if (!Array.isArray(satirlar) || satirlar.length === 0) {
    return { ...bos, hata: "No rows found to import." };
  }
  if (satirlar.length > AZAMI_SATIR) {
    return {
      ...bos,
      hata: `At most ${AZAMI_SATIR} rows can be imported at once.`,
    };
  }

  for (const satir of satirlar) {
    const gecerli =
      ISO_TARIH.test(satir.odeme_tarihi) &&
      typeof satir.tutar === "number" &&
      Number.isFinite(satir.tutar) &&
      satir.tutar > 0 &&
      (satir.aciklama == null ||
        (typeof satir.aciklama === "string" && satir.aciklama.length <= 500));
    if (!gecerli) {
      return { ...bos, hata: "Some rows are invalid. Check the column mapping." };
    }
  }

  const supabase = await createClient();

  // Duplicate heuristic: skip if the same date + amount + description was already imported from the bank
  const { data: mevcutlar, error: okumaHata } = await supabase
    .from("odemeler")
    .select("odeme_tarihi, tutar, aciklama")
    .eq("kaynak", "banka");
  if (okumaHata) {
    return { ...bos, hata: "Could not read existing payments. Try again." };
  }

  const anahtar = (t: string, tu: number, a: string | null) =>
    `${t}|${tu.toFixed(2)}|${(a ?? "").trim()}`;
  const mevcutAnahtarlar = new Set(
    (mevcutlar ?? []).map((o) =>
      anahtar(o.odeme_tarihi, Number(o.tutar), o.aciklama)
    )
  );

  const eklenecekler: EkstreSatir[] = [];
  let mukerrer = 0;
  for (const satir of satirlar) {
    const k = anahtar(satir.odeme_tarihi, satir.tutar, satir.aciklama);
    if (mevcutAnahtarlar.has(k)) {
      mukerrer++;
    } else {
      mevcutAnahtarlar.add(k); // also catch duplicates within the file
      eklenecekler.push(satir);
    }
  }

  let eklenen = 0;
  for (let i = 0; i < eklenecekler.length; i += 500) {
    const parca = eklenecekler.slice(i, i + 500).map((satir) => ({
      tutar: satir.tutar,
      odeme_tarihi: satir.odeme_tarihi,
      aciklama: satir.aciklama?.trim() || null,
      kaynak: "banka" as const,
    }));
    const { error } = await supabase.from("odemeler").insert(parca);
    if (error) {
      return {
        eklenen,
        mukerrer,
        hata: `Some payments could not be added (${eklenen}/${eklenecekler.length} added).`,
      };
    }
    eklenen += parca.length;
  }

  sayfalariYenile();
  return { eklenen, mukerrer };
}
