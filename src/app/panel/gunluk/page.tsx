import { createClient } from "@/lib/supabase/server";
import { OLAY_ETIKETLERI } from "@/lib/sabitler";

function zamanFormat(zaman: string) {
  return new Date(zaman).toLocaleString("tr-TR", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function paraFormat(tutar: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(tutar);
}

type OlaySatiri = {
  id: number;
  zaman: string;
  aktor: string;
  olay_tipi: string;
  detay: Record<string, unknown> | null;
};

function detayOzeti(olay: OlaySatiri): string {
  const detay = olay.detay ?? {};
  const parcalar: string[] = [];
  if (typeof detay.tutar === "number" || typeof detay.tutar === "string") {
    parcalar.push(paraFormat(Number(detay.tutar)));
  }
  if (typeof detay.sablon === "string") parcalar.push(detay.sablon);
  if (typeof detay.hata === "string" && detay.hata) {
    parcalar.push(`error: ${detay.hata}`);
  }
  return parcalar.join(" · ");
}

export default async function GunlukSayfasi() {
  const supabase = await createClient();

  const [{ data: olaylar }, { data: profiller }] = await Promise.all([
    supabase
      .from("olay_gunlugu")
      .select("id, zaman, aktor, olay_tipi, detay")
      .order("zaman", { ascending: false })
      .limit(200),
    supabase.from("kullanici_profilleri").select("id, ad_soyad"),
  ]);

  const adHaritasi = new Map(
    (profiller ?? []).map((profil) => [profil.id, profil.ad_soyad ?? "User"])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Event log</h1>
        <p className="mt-1 text-sm text-zinc-500">
          An immutable record of reminder and payment-matching activity.
          The last 200 events are shown.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Detail</th>
              <th className="px-4 py-3 font-medium">Performed by</th>
            </tr>
          </thead>
          <tbody>
            {((olaylar ?? []) as OlaySatiri[]).map((olay) => (
              <tr key={olay.id} className="border-b border-zinc-100">
                <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                  {zamanFormat(olay.zaman)}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {OLAY_ETIKETLERI[olay.olay_tipi] ?? olay.olay_tipi}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {detayOzeti(olay) || "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {olay.aktor === "sistem"
                    ? "System"
                    : (adHaritasi.get(olay.aktor) ?? "User")}
                </td>
              </tr>
            ))}
            {(olaylar ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
