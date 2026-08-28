"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IslemDurum = { hata?: string; mesaj?: string };

export async function musteriEkle(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const unvan = String(formData.get("unvan") ?? "").trim();
  if (!unvan) return { hata: "Company name is required." };

  const { error } = await supabase.from("musteriler").insert({
    unvan,
    vkn: String(formData.get("vkn") ?? "").trim() || null,
    eposta: String(formData.get("eposta") ?? "").trim() || null,
    telefon: String(formData.get("telefon") ?? "").trim() || null,
  });

  if (error) return { hata: "Could not add customer. Check your permissions." };

  revalidatePath("/panel/musteriler");
  return {};
}

export async function musteriGuncelle(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const unvan = String(formData.get("unvan") ?? "").trim();
  if (!id) return { hata: "Customer not found." };
  if (!unvan) return { hata: "Company name is required." };

  const { data, error } = await supabase
    .from("musteriler")
    .update({
      unvan,
      vkn: String(formData.get("vkn") ?? "").trim() || null,
      eposta: String(formData.get("eposta") ?? "").trim() || null,
      telefon: String(formData.get("telefon") ?? "").trim() || null,
    })
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { hata: "Could not update customer. Check your permissions." };
  }

  revalidatePath("/panel/musteriler");
  return { mesaj: "Customer updated." };
}

// Deletes the customer and all linked records (invoices, payments, matches,
// reminders). Watch the FK order: child records first. RLS allows deletion
// on these tables (same path as ornekVeriTemizle).
export async function musteriSil(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return { hata: "Customer not found." };

  const { data: faturalar } = await supabase
    .from("faturalar")
    .select("id")
    .eq("musteri_id", id);
  const faturaIdleri = (faturalar ?? []).map((f) => f.id);

  const { data: odemeler } = await supabase
    .from("odemeler")
    .select("id")
    .eq("musteri_id", id);
  const odemeIdleri = (odemeler ?? []).map((o) => o.id);

  if (faturaIdleri.length > 0) {
    await supabase
      .from("fatura_odeme_eslesmeleri")
      .delete()
      .in("fatura_id", faturaIdleri);
  }
  if (odemeIdleri.length > 0) {
    await supabase
      .from("fatura_odeme_eslesmeleri")
      .delete()
      .in("odeme_id", odemeIdleri);
  }
  await supabase.from("hatirlatmalar").delete().eq("musteri_id", id);
  if (faturaIdleri.length > 0) {
    await supabase.from("faturalar").delete().in("id", faturaIdleri);
  }
  await supabase.from("odemeler").delete().eq("musteri_id", id);

  const { error } = await supabase.from("musteriler").delete().eq("id", id);
  if (error) return { hata: "Could not delete customer. Check your permissions." };

  revalidatePath("/panel/musteriler");
  revalidatePath("/panel");
  revalidatePath("/panel/faturalar");
  revalidatePath("/panel/odemeler");
  return { mesaj: "Customer and linked records deleted." };
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
    return { hata: "Fill in all required fields." };
  }
  if (!Number.isFinite(tutar) || tutar <= 0) {
    return { hata: "Amount must be greater than zero." };
  }
  if (vadeTarihi < faturaTarihi) {
    return { hata: "Due date cannot be before the invoice date." };
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
      return { hata: "This invoice number is already registered." };
    }
    return { hata: "Could not add invoice. Check your permissions." };
  }

  revalidatePath("/panel/faturalar");
  revalidatePath("/panel");
  return {};
}

export async function faturaGuncelle(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const faturaNo = String(formData.get("fatura_no") ?? "").trim();
  const faturaTarihi = String(formData.get("fatura_tarihi") ?? "");
  const vadeTarihi = String(formData.get("vade_tarihi") ?? "");
  const tutar = Number(formData.get("tutar"));

  if (!id) return { hata: "Invoice not found." };
  if (!faturaNo || !faturaTarihi || !vadeTarihi) {
    return { hata: "Fill in all required fields." };
  }
  if (!Number.isFinite(tutar) || tutar <= 0) {
    return { hata: "Amount must be greater than zero." };
  }
  if (vadeTarihi < faturaTarihi) {
    return { hata: "Due date cannot be before the invoice date." };
  }

  // When the amount changes, recompute the remaining balance and status
  // based on the amount already matched (collected); preserve disputed status.
  const { data: mevcut } = await supabase
    .from("faturalar")
    .select("durum")
    .eq("id", id)
    .single();
  const { data: eslesmeler } = await supabase
    .from("fatura_odeme_eslesmeleri")
    .select("tutar")
    .eq("fatura_id", id);
  const tahsil = (eslesmeler ?? []).reduce((t, e) => t + Number(e.tutar), 0);
  const yeniKalan = Math.round((tutar - tahsil) * 100) / 100;
  if (yeniKalan < 0) {
    return {
      hata: `Amount cannot be less than the amount already collected (${tahsil.toLocaleString("tr-TR")} ₺).`,
    };
  }
  const durum =
    mevcut?.durum === "itilafli"
      ? "itilafli"
      : yeniKalan <= 0
        ? "kapali"
        : tahsil > 0
          ? "kismi"
          : "acik";

  const { data, error } = await supabase
    .from("faturalar")
    .update({
      fatura_no: faturaNo,
      fatura_tarihi: faturaTarihi,
      vade_tarihi: vadeTarihi,
      tutar,
      kalan_bakiye: yeniKalan,
      durum,
    })
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === "23505") {
      return { hata: "This invoice number is already registered." };
    }
    return { hata: "Could not update invoice. Check your permissions." };
  }
  if (!data || data.length === 0) {
    return { hata: "Could not update invoice. Check your permissions." };
  }

  revalidatePath("/panel/faturalar");
  revalidatePath("/panel");
  return { mesaj: "Invoice updated." };
}

// Deletes the invoice and its linked records (matches, reminders).
export async function faturaSil(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return { hata: "Invoice not found." };

  await supabase.from("fatura_odeme_eslesmeleri").delete().eq("fatura_id", id);
  await supabase.from("hatirlatmalar").delete().eq("fatura_id", id);

  const { error } = await supabase.from("faturalar").delete().eq("id", id);
  if (error) return { hata: "Could not delete invoice. Check your permissions." };

  revalidatePath("/panel/faturalar");
  revalidatePath("/panel");
  revalidatePath("/panel/odemeler");
  return { mesaj: "Invoice deleted." };
}

// ---- Sample data (for exploring the product on an empty account) ----

// A "use server" file can only export async functions;
// this tag is also queried on the panel page with the same value ("ornek-veri").
const ORNEK_VERI_ETIKETI = "ornek-veri";

function ornekSayfalariYenile() {
  for (const yol of [
    "/panel",
    "/panel/musteriler",
    "/panel/faturalar",
    "/panel/odemeler",
    "/panel/hatirlatmalar",
    "/panel/gunluk",
  ]) {
    revalidatePath(yol);
  }
}

export async function ornekVeriYukle() {
  const supabase = await createClient();

  // Don't add it a second time if it's already loaded.
  const { data: mevcut } = await supabase
    .from("musteriler")
    .select("id")
    .eq("notlar", ORNEK_VERI_ETIKETI)
    .limit(1);
  if ((mevcut ?? []).length > 0) return;

  const gun = (fark: number) =>
    new Date(Date.now() + fark * 86400000).toISOString().slice(0, 10);
  const zaman = (fark: number) =>
    new Date(Date.now() + fark * 86400000).toISOString();

  const { data: musteriler, error: musteriHata } = await supabase
    .from("musteriler")
    .insert(
      [
        "Starlight Metal Industries Inc.",
        "Apex Packaging Co.",
        "Ironstone Building Supplies",
        "Meridian Food Distribution Inc.",
        "Nova Textiles Co.",
        "Kardelen Office Systems",
      ].map((unvan, i) => ({
        unvan,
        vkn: `999000000${i + 1}`,
        eposta: `accounting@sample-customer-${i + 1}.example`,
        izin_eposta: true,
        notlar: ORNEK_VERI_ETIKETI,
      }))
    )
    .select("id");
  if (musteriHata || !musteriler || musteriler.length !== 6) return;

  // m: customer index; t/v: invoice/due day relative to today; o: payment day (null = open);
  // h: sent reminder [day, template]; kalan: remaining balance on a partial payment.
  const kayitlar: {
    m: number;
    no: string;
    t: number;
    v: number;
    tutar: number;
    o?: number;
    odemeTutari?: number;
    h?: [number, string, string];
  }[] = [
    { m: 0, no: "DEMO-2026-001", t: -105, v: -75, tutar: 84500, o: -62 },
    { m: 1, no: "DEMO-2026-002", t: -95, v: -65, tutar: 46200, o: -58 },
    { m: 2, no: "DEMO-2026-003", t: -80, v: -50, tutar: 132750, o: -38 },
    { m: 3, no: "DEMO-2026-004", t: -60, v: -30, tutar: 58900, o: -20, h: [-27, "nazik_gecikme", "gonderildi"] },
    { m: 4, no: "DEMO-2026-005", t: -45, v: -15, tutar: 39400, o: -8, h: [-12, "nazik_gecikme", "acildi"] },
    { m: 0, no: "DEMO-2026-006", t: -40, v: -10, tutar: 91800, o: -4, h: [-8, "nazik_gecikme", "gonderildi"] },
    { m: 5, no: "DEMO-2026-007", t: -50, v: -20, tutar: 120000, o: -10, odemeTutari: 60000, h: [-16, "nazik_gecikme", "gonderildi"] },
    { m: 1, no: "DEMO-2026-008", t: -65, v: -35, tutar: 74300, h: [-28, "kararli_gecikme", "gonderildi"] },
    { m: 2, no: "DEMO-2026-009", t: -52, v: -22, tutar: 28650, h: [-15, "nazik_gecikme", "acildi"] },
    { m: 3, no: "DEMO-2026-010", t: -42, v: -12, tutar: 66500, h: [-5, "nazik_gecikme", "gonderildi"] },
    { m: 0, no: "DEMO-2026-011", t: -34, v: -4, tutar: 47800 },
    { m: 4, no: "DEMO-2026-012", t: -20, v: 10, tutar: 55250, h: [-3, "on_hatirlatma", "gonderildi"] },
    { m: 5, no: "DEMO-2026-013", t: -12, v: 18, tutar: 83600 },
    { m: 1, no: "DEMO-2026-014", t: -5, v: 25, tutar: 37900 },
  ];

  const { data: faturalar, error: faturaHata } = await supabase
    .from("faturalar")
    .insert(
      kayitlar.map((kayit) => ({
        musteri_id: musteriler[kayit.m].id,
        fatura_no: kayit.no,
        fatura_tarihi: gun(kayit.t),
        vade_tarihi: gun(kayit.v),
        tutar: kayit.tutar,
        kalan_bakiye: kayit.tutar,
        kaynak: "manuel",
      }))
    )
    .select("id, fatura_no");
  if (faturaHata || !faturalar) return;

  const faturaIdleri = new Map(faturalar.map((f) => [f.fatura_no, f.id]));

  // Payments + matching: the odeme_eslestir RPC updates the balance/status.
  for (const kayit of kayitlar) {
    if (kayit.o === undefined) continue;
    const odemeTutari = kayit.odemeTutari ?? kayit.tutar;
    const { data: odeme } = await supabase
      .from("odemeler")
      .insert({
        musteri_id: musteriler[kayit.m].id,
        tutar: odemeTutari,
        odeme_tarihi: gun(kayit.o),
        kaynak: "banka",
        aciklama: `Bank transfer — ${kayit.no}`,
      })
      .select("id")
      .single();
    const faturaId = faturaIdleri.get(kayit.no);
    if (odeme && faturaId) {
      await supabase.rpc("odeme_eslestir", {
        p_odeme_id: odeme.id,
        p_fatura_id: faturaId,
        p_tutar: odemeTutari,
      });
    }
  }

  await supabase.from("hatirlatmalar").insert(
    kayitlar.flatMap((kayit) => {
      const faturaId = faturaIdleri.get(kayit.no);
      if (!kayit.h || !faturaId) return [];
      const [hGun, sablon, durum] = kayit.h;
      return [
        {
          fatura_id: faturaId,
          musteri_id: musteriler[kayit.m].id,
          kanal: "eposta",
          sablon_kodu: sablon,
          planlanan_zaman: zaman(hGun),
          gonderilen_zaman: zaman(hGun),
          durum,
        },
      ];
    })
  );

  ornekSayfalariYenile();
}

export async function ornekVeriTemizle() {
  const supabase = await createClient();

  const { data: musteriler } = await supabase
    .from("musteriler")
    .select("id")
    .eq("notlar", ORNEK_VERI_ETIKETI);
  const musteriIdleri = (musteriler ?? []).map((m) => m.id);
  if (musteriIdleri.length === 0) return;

  const { data: faturalar } = await supabase
    .from("faturalar")
    .select("id")
    .in("musteri_id", musteriIdleri);
  const faturaIdleri = (faturalar ?? []).map((f) => f.id);

  if (faturaIdleri.length > 0) {
    await supabase
      .from("fatura_odeme_eslesmeleri")
      .delete()
      .in("fatura_id", faturaIdleri);
    await supabase.from("hatirlatmalar").delete().in("fatura_id", faturaIdleri);
    await supabase.from("faturalar").delete().in("id", faturaIdleri);
  }
  await supabase.from("odemeler").delete().in("musteri_id", musteriIdleri);
  await supabase.from("musteriler").delete().in("id", musteriIdleri);

  ornekSayfalariYenile();
}
