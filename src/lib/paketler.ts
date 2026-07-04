// Paket tanımları ve özellik kapıları.
// Fiyatlar USD (plan.md'deki fiyatlama); yıllıkta ~2 ay bedava.

export const DENEME_GUN = 14;

export type PaketKodu = "deneme" | "baslangic" | "profesyonel" | "isletme";

export type Ozellik =
  | "eposta_dunning"
  | "dso_panosu"
  | "whatsapp"
  | "odeme_linki" // v1
  | "risk_skoru" // v1
  | "nakit_tahmini"; // v1

export const PAKETLER: {
  kod: Exclude<PaketKodu, "deneme">;
  ad: string;
  aylikUsd: number;
  yillikUsd: number;
  ozet: string;
  ozellikler: string[];
  one_cikan?: boolean;
}[] = [
  {
    kod: "baslangic",
    ad: "Başlangıç",
    aylikUsd: 12,
    yillikUsd: 120,
    ozet: "Otomatik hatırlatmaya ilk adım",
    ozellikler: [
      "Otomatik e-posta hatırlatmaları",
      "Kadans kural motoru",
      "DSO panosu ve yaşlandırma",
      "CSV / e-Fatura XML içe aktarma",
    ],
  },
  {
    kod: "profesyonel",
    ad: "Profesyonel",
    aylikUsd: 24,
    yillikUsd: 240,
    ozet: "Çok kanallı tahsilat",
    one_cikan: true,
    ozellikler: [
      "Başlangıç'taki her şey",
      "WhatsApp hatırlatmaları",
      "Tek tık ödeme linki (yakında)",
      "Banka ekstresi eşleştirme",
    ],
  },
  {
    kod: "isletme",
    ad: "İşletme",
    aylikUsd: 48,
    yillikUsd: 480,
    ozet: "Öngörü ve risk yönetimi",
    ozellikler: [
      "Profesyonel'deki her şey",
      "Müşteri risk skoru (yakında)",
      "30/60/90 gün nakit akışı tahmini (yakında)",
      "Öncelikli destek",
    ],
  },
];

const OZELLIK_MATRISI: Record<Exclude<PaketKodu, "deneme">, Ozellik[]> = {
  baslangic: ["eposta_dunning", "dso_panosu"],
  profesyonel: ["eposta_dunning", "dso_panosu", "whatsapp", "odeme_linki"],
  isletme: [
    "eposta_dunning",
    "dso_panosu",
    "whatsapp",
    "odeme_linki",
    "risk_skoru",
    "nakit_tahmini",
  ],
};

export function denemeKalanGun(
  hesapOlusturma: string,
  bugun = new Date()
): number {
  const baslangic = new Date(hesapOlusturma).getTime();
  const gecen = Math.floor((bugun.getTime() - baslangic) / 86400000);
  return Math.max(0, DENEME_GUN - gecen);
}

/** Deneme süresince her şey açık; sonrasında paket matrisi geçerli. */
export function ozellikAcikMi(
  paket: string,
  hesapOlusturma: string,
  ozellik: Ozellik
): boolean {
  if (paket === "deneme") {
    return denemeKalanGun(hesapOlusturma) > 0
      ? true
      : OZELLIK_MATRISI.baslangic.includes(ozellik); // süresi biten deneme Başlangıç gibi davranır
  }
  const liste = OZELLIK_MATRISI[paket as Exclude<PaketKodu, "deneme">];
  return liste ? liste.includes(ozellik) : false;
}

export const PAKET_ETIKETLERI: Record<string, string> = {
  deneme: "Deneme",
  baslangic: "Başlangıç",
  profesyonel: "Profesyonel",
  isletme: "İşletme",
};
