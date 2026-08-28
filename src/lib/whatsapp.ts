// WhatsApp copy-and-send fallback helpers.
// A pre-approved WhatsApp Business API (BSP) integration is coming in v1;
// until then, the user sends a ready-made message from their own phone via
// a wa.me link.

import type { SablonGirdisi } from "@/lib/eposta/sablonlar";

/**
 * Converts a Turkish phone number into wa.me format (country code, digits
 * only). "0532 123 45 67" -> "905321234567"; null if it can't be converted.
 */
export function telefonNormallestir(ham: string): string | null {
  const rakamlar = ham.replace(/\D/g, "");
  if (!rakamlar) return null;

  let sonuc: string;
  if (rakamlar.startsWith("90") && rakamlar.length === 12) {
    sonuc = rakamlar;
  } else if (rakamlar.startsWith("0") && rakamlar.length === 11) {
    sonuc = `9${rakamlar}`; // 0xxx -> 90xxx
  } else if (rakamlar.startsWith("5") && rakamlar.length === 10) {
    sonuc = `90${rakamlar}`;
  } else if (rakamlar.length >= 11 && rakamlar.length <= 15) {
    sonuc = rakamlar; // foreign number: leave as-is
  } else {
    return null;
  }
  return sonuc;
}

export function waLinkUret(numara: string, mesaj: string): string {
  return `https://wa.me/${numara}?text=${encodeURIComponent(mesaj)}`;
}

function paraFormat(tutar: number, paraBirimi: string): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: paraBirimi,
    }).format(tutar);
  } catch {
    return `${tutar.toFixed(2)} ${paraBirimi}`;
  }
}

function tarihFormat(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Short, friendly WhatsApp counterparts of the email templates. */
export function whatsappMesajUret(
  sablonKodu: string,
  girdi: SablonGirdisi
): string {
  const tutar = paraFormat(girdi.kalanBakiye, girdi.paraBirimi);
  const vade = tarihFormat(girdi.vadeTarihi);
  const imza = `Best regards,\n${girdi.gonderenUnvan}`;

  switch (sablonKodu) {
    case "on_hatirlatma":
      return `Hello, a note for ${girdi.musteriUnvan}:\n\nOur invoice ${girdi.faturaNo} (${tutar}) is due on ${vade}. We wanted to send a quick heads-up so you can plan ahead. 🙂\n\n${imza}`;
    case "vade_gunu":
      return `Hello, a note for ${girdi.musteriUnvan}:\n\nOur invoice ${girdi.faturaNo} (${tutar}) is due today (${vade}). If your payment is already scheduled, no further action is needed.\n\n${imza}`;
    case "kararli_gecikme":
      return `Hello, to ${girdi.musteriUnvan},\n\nOur invoice ${girdi.faturaNo} (${tutar}) was due ${girdi.gecikmeGunu} days ago (${vade}) and we haven't yet received the payment. Please arrange payment within the next few business days; if there's an issue, we're happy to work out a solution together.\n\n${imza}`;
    case "nazik_gecikme":
    default:
      return `Hello, a note for ${girdi.musteriUnvan}:\n\nOur invoice ${girdi.faturaNo} (${tutar}) was due on ${vade}, and we haven't seen the payment come through yet. It may simply have slipped by, so we wanted to send a gentle reminder. If you've already paid, please disregard this message. 🙏\n\n${imza}`;
  }
}
