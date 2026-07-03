import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  KANAL_ETIKETLERI,
  SABLON_ETIKETLERI,
  gunFarkiEtiketi,
} from "@/lib/sabitler";
import { kadansAktifDegistir, kadansSil } from "../actions";
import { KadansForm } from "./kadans-form";

export default async function KadansSayfasi() {
  const supabase = await createClient();

  const { data: adimlar } = await supabase
    .from("kadans_adimlari")
    .select("id, gun_farki, sablon_kodu, kanal, aktif")
    .order("gun_farki", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/panel/hatirlatmalar"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Hatırlatmalar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
          Kadans ayarları
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Açık faturalar için hatırlatmaların ne zaman ve hangi tonda
          planlanacağını belirler. Değişiklik yeni planlanan hatırlatmalara
          uygulanır.
        </p>
      </div>

      <KadansForm />

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Zamanlama</th>
              <th className="px-4 py-3 font-medium">Şablon</th>
              <th className="px-4 py-3 font-medium">Kanal</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(adimlar ?? []).map((adim) => (
              <tr
                key={adim.id}
                className={`border-b border-zinc-100 ${
                  adim.aktif ? "" : "opacity-50"
                }`}
              >
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {gunFarkiEtiketi(adim.gun_farki)}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {SABLON_ETIKETLERI[adim.sablon_kodu] ?? adim.sablon_kodu}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {KANAL_ETIKETLERI[adim.kanal] ?? adim.kanal}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      adim.aktif
                        ? "bg-green-50 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {adim.aktif ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <form action={kadansAktifDegistir}>
                      <input type="hidden" name="id" value={adim.id} />
                      <input
                        type="hidden"
                        name="aktif"
                        value={String(!adim.aktif)}
                      />
                      <button
                        type="submit"
                        className="text-sm text-zinc-700 hover:underline"
                      >
                        {adim.aktif ? "Duraklat" : "Aktifleştir"}
                      </button>
                    </form>
                    <form action={kadansSil}>
                      <input type="hidden" name="id" value={adim.id} />
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:underline"
                      >
                        Sil
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(adimlar ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Kadans adımı yok. Yukarıdaki formdan ekleyin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
