// WhatsApp kopyala-gönder fallback yardımcıları.
// Onaylı WhatsApp Business API (BSP) entegrasyonu v1'de gelecek; o zamana
// dek hazır mesaj + wa.me linkiyle kullanıcı kendi telefonundan gönderir.

import type { SablonGirdisi } from "@/lib/eposta/sablonlar";

/**
 * Türk telefon numarasını wa.me biçimine (ülke kodlu, yalnız rakam) çevirir.
 * "0532 123 45 67" -> "905321234567"; çevrilemiyorsa null.
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
    sonuc = rakamlar; // yabancı numara: olduğu gibi
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
  return new Date(`${iso}T00:00:00`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** E-posta şablonlarının kısa, samimi WhatsApp karşılıkları. */
export function whatsappMesajUret(
  sablonKodu: string,
  girdi: SablonGirdisi
): string {
  const tutar = paraFormat(girdi.kalanBakiye, girdi.paraBirimi);
  const vade = tarihFormat(girdi.vadeTarihi);
  const imza = `İyi çalışmalar dileriz.\n${girdi.gonderenUnvan}`;

  switch (sablonKodu) {
    case "on_hatirlatma":
      return `Merhaba, ${girdi.musteriUnvan} yetkilisine notumuzdur:\n\n${girdi.faturaNo} numaralı faturamızın (${tutar}) vadesi ${vade} tarihinde doluyor. Planlamanız için kısa bir hatırlatma iletmek istedik. 🙂\n\n${imza}`;
    case "vade_gunu":
      return `Merhaba, ${girdi.musteriUnvan} yetkilisine notumuzdur:\n\n${girdi.faturaNo} numaralı faturamızın (${tutar}) vadesi bugün (${vade}) doluyor. Ödemeniz planlandıysa ayrıca işlem gerekmez.\n\n${imza}`;
    case "kararli_gecikme":
      return `Merhaba, ${girdi.musteriUnvan} yetkilisi,\n\n${girdi.faturaNo} numaralı faturamızın (${tutar}) vadesi ${girdi.gecikmeGunu} gün önce (${vade}) doldu ve ödeme kayıtlarımıza ulaşmadı. Ödemenin birkaç iş günü içinde yapılmasını rica ederiz; bir zorluk varsa birlikte çözüm bulmaktan memnuniyet duyarız.\n\n${imza}`;
    case "nazik_gecikme":
    default:
      return `Merhaba, ${girdi.musteriUnvan} yetkilisine notumuzdur:\n\n${girdi.faturaNo} numaralı faturamızın (${tutar}) vadesi ${vade} tarihinde doldu; ödeme henüz kayıtlarımıza yansımadı. Gözden kaçmış olabilir diye nazikçe hatırlatmak istedik. Ödediyseniz lütfen dikkate almayın. 🙏\n\n${imza}`;
  }
}
