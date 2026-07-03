// Kadans/hatırlatma alanlarının kullanıcıya dönük etiketleri

export const SABLON_ETIKETLERI: Record<string, string> = {
  on_hatirlatma: "Ön hatırlatma (nazik)",
  vade_gunu: "Vade günü bildirimi",
  nazik_gecikme: "Nazik gecikme hatırlatması",
  kararli_gecikme: "Kararlı gecikme hatırlatması",
};

export const KANAL_ETIKETLERI: Record<string, string> = {
  eposta: "E-posta",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export const HATIRLATMA_DURUMLARI: Record<
  string,
  { etiket: string; sinif: string }
> = {
  planlandi: { etiket: "Planlandı", sinif: "bg-blue-50 text-blue-700" },
  gonderildi: { etiket: "Gönderildi", sinif: "bg-green-50 text-green-700" },
  acildi: { etiket: "Açıldı", sinif: "bg-emerald-50 text-emerald-700" },
  tiklandi: { etiket: "Tıklandı", sinif: "bg-emerald-50 text-emerald-800" },
  yanitlandi: { etiket: "Yanıtlandı", sinif: "bg-purple-50 text-purple-700" },
  iptal: { etiket: "İptal", sinif: "bg-zinc-100 text-zinc-500" },
};

/** Gün farkını insan diline çevirir: -3 -> "vadeden 3 gün önce" */
export function gunFarkiEtiketi(gunFarki: number): string {
  if (gunFarki < 0) return `Vadeden ${-gunFarki} gün önce`;
  if (gunFarki === 0) return "Vade günü";
  return `Vadeden ${gunFarki} gün sonra`;
}
