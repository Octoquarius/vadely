import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  HATIRLATMA_DURUMLARI,
  KANAL_ETIKETLERI,
  SABLON_ETIKETLERI,
} from "@/lib/sabitler";
import { hatirlatmaIptal } from "./actions";
import { PlanUretDugmesi } from "./plan-uret-dugmesi";
import { BekleyenleriGonderDugmesi } from "./gonder-dugmesi";

function zamanFormat(zaman: string) {
  return new Date(zaman).toLocaleString("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

type HatirlatmaSatiri = {
  id: string;
  kanal: string;
  sablon_kodu: string | null;
  planlanan_zaman: string;
  gonderilen_zaman: string | null;
  durum: string;
  faturalar: { fatura_no: string } | null;
  musteriler: { unvan: string; eposta: string | null } | null;
};

export default async function HatirlatmalarSayfasi() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("hatirlatmalar")
    .select(
      "id, kanal, sablon_kodu, planlanan_zaman, gonderilen_zaman, durum, faturalar ( fatura_no ), musteriler ( unvan, eposta )"
    )
    .order("planlanan_zaman", { ascending: false })
    .limit(200);

  const hatirlatmalar = (data ?? []) as unknown as HatirlatmaSatiri[];
  const bekleyenler = hatirlatmalar
    .filter((h) => h.durum === "planlandi")
    .sort((a, b) => a.planlanan_zaman.localeCompare(b.planlanan_zaman));
  const gecmis = hatirlatmalar.filter((h) => h.durum !== "planlandi");
  const epostasizSayisi = bekleyenler.filter(
    (h) => !h.musteriler?.eposta
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Hatırlatmalar</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/panel/hatirlatmalar/kadans"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            ⚙ Kadans ayarları
          </Link>
          <PlanUretDugmesi />
          <BekleyenleriGonderDugmesi />
        </div>
      </div>

      <p className="text-sm text-zinc-500">
        Plan her sabah 08:00&apos;de otomatik üretilir; açık faturalarınız
        kadans kurallarınıza bağlanır. Zamanı gelen hatırlatmaları
        &quot;Bekleyenleri gönder&quot; ile e-postayla iletebilir, göndermeden
        önce &quot;Önizle&quot; ile metni görebilirsiniz.
      </p>

      {epostasizSayisi > 0 && (
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {epostasizSayisi} bekleyen hatırlatmanın müşterisinde e-posta adresi
          yok.{" "}
          <Link href="/panel/musteriler" className="font-medium underline">
            Müşteri kartlarını tamamlayın
          </Link>{" "}
          yoksa bu hatırlatmalar gönderilemez.
        </p>
      )}

      <section>
        <h2 className="text-sm font-semibold text-zinc-900">
          Bekleyenler ({bekleyenler.length})
        </h2>
        <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Planlanan zaman</th>
                <th className="px-4 py-3 font-medium">Fatura</th>
                <th className="px-4 py-3 font-medium">Müşteri</th>
                <th className="px-4 py-3 font-medium">Şablon</th>
                <th className="px-4 py-3 font-medium">Kanal</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {bekleyenler.map((hatirlatma) => (
                <tr key={hatirlatma.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 text-zinc-900">
                    {zamanFormat(hatirlatma.planlanan_zaman)}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {hatirlatma.faturalar?.fatura_no ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {hatirlatma.musteriler?.unvan ?? "—"}
                    {!hatirlatma.musteriler?.eposta && (
                      <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                        e-posta yok
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {SABLON_ETIKETLERI[hatirlatma.sablon_kodu ?? ""] ??
                      hatirlatma.sablon_kodu}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {KANAL_ETIKETLERI[hatirlatma.kanal] ?? hatirlatma.kanal}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/panel/hatirlatmalar/${hatirlatma.id}`}
                        className="text-sm font-medium text-zinc-900 underline"
                      >
                        Önizle
                      </Link>
                      <form action={hatirlatmaIptal}>
                        <input type="hidden" name="id" value={hatirlatma.id} />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:underline"
                        >
                          İptal et
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {bekleyenler.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    Bekleyen hatırlatma yok. Açık faturanız varsa &quot;Planı
                    şimdi üret&quot; ile oluşturabilirsiniz.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {gecmis.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-900">
            Geçmiş ({gecmis.length})
          </h2>
          <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Zaman</th>
                  <th className="px-4 py-3 font-medium">Fatura</th>
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 font-medium">Şablon</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {gecmis.map((hatirlatma) => {
                  const durumBilgi =
                    HATIRLATMA_DURUMLARI[hatirlatma.durum] ??
                    HATIRLATMA_DURUMLARI.planlandi;
                  return (
                    <tr key={hatirlatma.id} className="border-b border-zinc-100">
                      <td className="px-4 py-3 text-zinc-600">
                        {zamanFormat(
                          hatirlatma.gonderilen_zaman ??
                            hatirlatma.planlanan_zaman
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {hatirlatma.faturalar?.fatura_no ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {hatirlatma.musteriler?.unvan ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {SABLON_ETIKETLERI[hatirlatma.sablon_kodu ?? ""] ??
                          hatirlatma.sablon_kodu}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${durumBilgi.sinif}`}
                        >
                          {durumBilgi.etiket}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
