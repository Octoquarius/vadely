// Plan definitions and feature gates.
// Prices in USD (pricing per plan.md); annual billing gets ~2 months free.

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
    ad: "Starter",
    aylikUsd: 12,
    yillikUsd: 120,
    ozet: "The first step toward automatic reminders",
    ozellikler: [
      "Automatic email reminders",
      "Cadence rule engine",
      "DSO dashboard and aging",
      "CSV / e-Invoice XML import",
    ],
  },
  {
    kod: "profesyonel",
    ad: "Professional",
    aylikUsd: 24,
    yillikUsd: 240,
    ozet: "Multi-channel collections",
    one_cikan: true,
    ozellikler: [
      "Everything in Starter",
      "WhatsApp reminders",
      "One-click payment link (coming soon)",
      "Bank statement matching",
    ],
  },
  {
    kod: "isletme",
    ad: "Business",
    aylikUsd: 48,
    yillikUsd: 480,
    ozet: "Forecasting and risk management",
    ozellikler: [
      "Everything in Professional",
      "Customer risk score (coming soon)",
      "30/60/90-day cash-flow forecast (coming soon)",
      "Priority support",
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

/** Everything is unlocked during the trial; the plan matrix applies afterward. */
export function ozellikAcikMi(
  paket: string,
  hesapOlusturma: string,
  ozellik: Ozellik
): boolean {
  if (paket === "deneme") {
    return denemeKalanGun(hesapOlusturma) > 0
      ? true
      : OZELLIK_MATRISI.baslangic.includes(ozellik); // an expired trial behaves like Starter
  }
  const liste = OZELLIK_MATRISI[paket as Exclude<PaketKodu, "deneme">];
  return liste ? liste.includes(ozellik) : false;
}

export const PAKET_ETIKETLERI: Record<string, string> = {
  deneme: "Trial",
  baslangic: "Starter",
  profesyonel: "Professional",
  isletme: "Business",
};
