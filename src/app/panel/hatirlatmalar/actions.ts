"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gondericiOlustur } from "@/lib/eposta/gonderici";
import { sablonUret, type SablonGirdisi } from "@/lib/eposta/sablonlar";

export type IslemDurum = { hata?: string; mesaj?: string };

type GonderilecekHatirlatma = {
  id: string;
  sablon_kodu: string | null;
  faturalar: {
    fatura_no: string;
    fatura_tarihi: string;
    vade_tarihi: string;
    kalan_bakiye: number;
    para_birimi: string;
    durum: string;
  } | null;
  musteriler: {
    unvan: string;
    eposta: string | null;
    izin_eposta: boolean;
  } | null;
};

function gecikmeGunuHesapla(vadeTarihi: string): number {
  const vade = new Date(`${vadeTarihi}T00:00:00Z`).getTime();
  const bugun = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z").getTime();
  return Math.round((bugun - vade) / 86400000);
}

async function hatirlatmaGonderVeIsaretle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gonderici: NonNullable<ReturnType<typeof gondericiOlustur>>,
  hatirlatma: GonderilecekHatirlatma,
  gonderenUnvan: string
): Promise<"gonderildi" | "atlandi" | "iptal" | "hata"> {
  const fatura = hatirlatma.faturalar;
  const musteri = hatirlatma.musteriler;

  // If the invoice was closed in the meantime, silently cancel the reminder
  if (!fatura || !(fatura.durum === "acik" || fatura.durum === "kismi")) {
    await supabase
      .from("hatirlatmalar")
      .update({ durum: "iptal", hata: "Automatically canceled because the invoice was closed" })
      .eq("id", hatirlatma.id)
      .eq("durum", "planlandi");
    return "iptal";
  }

  if (!musteri?.eposta || !musteri.izin_eposta) {
    return "atlandi"; // stays scheduled; goes out once the user adds an email
  }

  const girdi: SablonGirdisi = {
    gonderenUnvan,
    musteriUnvan: musteri.unvan,
    faturaNo: fatura.fatura_no,
    faturaTarihi: fatura.fatura_tarihi,
    vadeTarihi: fatura.vade_tarihi,
    kalanBakiye: Number(fatura.kalan_bakiye),
    paraBirimi: fatura.para_birimi,
    gecikmeGunu: gecikmeGunuHesapla(fatura.vade_tarihi),
  };

  const icerik = sablonUret(hatirlatma.sablon_kodu ?? "nazik_gecikme", girdi);
  const sonuc = await gonderici.gonder(musteri.eposta, icerik);

  if (sonuc.tamam) {
    await supabase
      .from("hatirlatmalar")
      .update({
        durum: "gonderildi",
        gonderilen_zaman: new Date().toISOString(),
        saglayici_mesaj_id: sonuc.mesajId,
        hata: null,
      })
      .eq("id", hatirlatma.id)
      .eq("durum", "planlandi");
    return "gonderildi";
  }

  await supabase
    .from("hatirlatmalar")
    .update({ hata: sonuc.hata })
    .eq("id", hatirlatma.id);
  return "hata";
}

const GONDERIM_SECIMI =
  "id, sablon_kodu, faturalar ( fatura_no, fatura_tarihi, vade_tarihi, kalan_bakiye, para_birimi, durum ), musteriler ( unvan, eposta, izin_eposta )";

async function gonderenUnvanGetir(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const { data } = await supabase.from("hesaplar").select("ad").single();
  return data?.ad ?? "Our company";
}

export async function bekleyenleriGonder(
  _onceki: IslemDurum,
  _formData: FormData
): Promise<IslemDurum> {
  const gonderici = gondericiOlustur();
  if (!gonderici) {
    return {
      hata: "Email provider not configured. Add RESEND_API_KEY to your .env.local file.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hatirlatmalar")
    .select(GONDERIM_SECIMI)
    .eq("durum", "planlandi")
    .eq("kanal", "eposta")
    .lte("planlanan_zaman", new Date().toISOString())
    .order("planlanan_zaman", { ascending: true })
    .limit(50);

  if (error) return { hata: "Could not read pending reminders." };

  const bekleyenler = (data ?? []) as unknown as GonderilecekHatirlatma[];
  if (bekleyenler.length === 0) {
    return { mesaj: "No reminders to send (none due yet)." };
  }

  const gonderenUnvan = await gonderenUnvanGetir(supabase);
  const sayac = { gonderildi: 0, atlandi: 0, iptal: 0, hata: 0 };

  for (const hatirlatma of bekleyenler) {
    const sonuc = await hatirlatmaGonderVeIsaretle(
      supabase,
      gonderici,
      hatirlatma,
      gonderenUnvan
    );
    sayac[sonuc]++;
  }

  revalidatePath("/panel/hatirlatmalar");

  const parcalar = [`${sayac.gonderildi} sent`];
  if (sayac.atlandi > 0) parcalar.push(`${sayac.atlandi} skipped (no email/permission)`);
  if (sayac.iptal > 0) parcalar.push(`${sayac.iptal} canceled (invoice closed)`);
  if (sayac.hata > 0) parcalar.push(`${sayac.hata} failed`);
  return { mesaj: parcalar.join(", ") + "." };
}

export async function tekHatirlatmaGonder(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { hata: "Reminder not found." };

  const gonderici = gondericiOlustur();
  if (!gonderici) {
    return {
      hata: "Email provider not configured. Add RESEND_API_KEY to your .env.local file.",
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("hatirlatmalar")
    .select(GONDERIM_SECIMI)
    .eq("id", id)
    .eq("durum", "planlandi")
    .single();

  if (!data) return { hata: "Reminder not found or already sent." };

  const gonderenUnvan = await gonderenUnvanGetir(supabase);
  const sonuc = await hatirlatmaGonderVeIsaretle(
    supabase,
    gonderici,
    data as unknown as GonderilecekHatirlatma,
    gonderenUnvan
  );

  revalidatePath("/panel/hatirlatmalar");
  revalidatePath(`/panel/hatirlatmalar/${id}`);

  switch (sonuc) {
    case "gonderildi":
      return { mesaj: "Reminder sent." };
    case "atlandi":
      return { hata: "The customer has no email address or permission." };
    case "iptal":
      return { hata: "Reminder canceled because the invoice was closed." };
    default:
      return { hata: "Send failed. See the reminder record for details." };
  }
}

export async function planUret(
  _onceki: IslemDurum,
  _formData: FormData
): Promise<IslemDurum> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("hatirlatma_plani_uret_benim");
  if (error) {
    return { hata: "Could not generate the plan. Please try again." };
  }

  revalidatePath("/panel/hatirlatmalar");
  const adet = Number(data ?? 0);
  return {
    mesaj:
      adet > 0
        ? `${adet} new reminder(s) scheduled.`
        : "No new reminders to schedule (everything is up to date).",
  };
}

export async function whatsappGonderildiIsaretle(
  _onceki: IslemDurum,
  formData: FormData
): Promise<IslemDurum> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { hata: "Reminder not found." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hatirlatmalar")
    .update({
      kanal: "whatsapp",
      durum: "gonderildi",
      gonderilen_zaman: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("durum", "planlandi")
    .select("id");

  if (error || !data || data.length === 0) {
    return { hata: "Could not mark as sent (it may already be sent)." };
  }

  revalidatePath("/panel/hatirlatmalar");
  revalidatePath(`/panel/hatirlatmalar/${id}`);
  return { mesaj: "Marked as sent via WhatsApp." };
}

export async function hatirlatmaIptal(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase
    .from("hatirlatmalar")
    .update({ durum: "iptal" })
    .eq("id", id)
    .eq("durum", "planlandi"); // only reminders that haven't been sent yet can be canceled

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
    return { hata: "Day offset must be a whole number between -60 and 365." };
  }

  const { error } = await supabase.from("kadans_adimlari").insert({
    gun_farki: gunFarki,
    sablon_kodu: sablonKodu,
    kanal: "eposta",
  });

  if (error) {
    if (error.code === "23505") {
      return { hata: "A step already exists for this day offset." };
    }
    return { hata: "Could not add the step. Check your permissions." };
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
