// User-facing labels for cadence/reminder fields

export const SABLON_ETIKETLERI: Record<string, string> = {
  on_hatirlatma: "Pre-reminder (gentle)",
  vade_gunu: "Due date notice",
  nazik_gecikme: "Gentle overdue reminder",
  kararli_gecikme: "Firm overdue reminder",
};

export const KANAL_ETIKETLERI: Record<string, string> = {
  eposta: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export const HATIRLATMA_DURUMLARI: Record<
  string,
  { etiket: string; sinif: string }
> = {
  planlandi: { etiket: "Scheduled", sinif: "bg-blue-50 text-blue-700" },
  gonderildi: { etiket: "Sent", sinif: "bg-green-50 text-green-700" },
  acildi: { etiket: "Opened", sinif: "bg-emerald-50 text-emerald-700" },
  tiklandi: { etiket: "Clicked", sinif: "bg-emerald-50 text-emerald-800" },
  yanitlandi: { etiket: "Replied", sinif: "bg-purple-50 text-purple-700" },
  iptal: { etiket: "Canceled", sinif: "bg-zinc-100 text-zinc-500" },
};

export const OLAY_ETIKETLERI: Record<string, string> = {
  hatirlatma_planlandi: "Reminder scheduled",
  hatirlatma_gonderildi: "Reminder sent",
  hatirlatma_acildi: "Email opened",
  hatirlatma_tiklandi: "Link in email clicked",
  hatirlatma_yanitlandi: "Customer replied",
  hatirlatma_iptal: "Reminder canceled",
  eslesme_eklendi: "Payment matched to invoice",
  eslesme_kaldirildi: "Payment match removed",
};

/** Converts a day offset into human-readable text: -3 -> "3 days before due date" */
export function gunFarkiEtiketi(gunFarki: number): string {
  if (gunFarki < 0) return `${-gunFarki} days before due date`;
  if (gunFarki === 0) return "Due date";
  return `${gunFarki} days after due date`;
}
