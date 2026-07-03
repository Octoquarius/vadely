import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { faturaSil } from "../actions";
import { FaturaForm } from "./fatura-form";

const DURUM_ETIKETLERI: Record<string, { etiket: string; sinif: string }> = {
  acik: { etiket: "Açık", sinif: "bg-amber-50 text-amber-700" },
  kismi: { etiket: "Kısmi", sinif: "bg-blue-50 text-blue-700" },
  kapali: { etiket: "Kapalı", sinif: "bg-green-50 text-green-700" },
  itilafli: { etiket: "İtilaflı", sinif: "bg-red-50 text-red-700" },
};

function paraFormat(tutar: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(tutar);
}

function tarihFormat(tarih: string) {
  return new Date(tarih).toLocaleDateString("tr-TR");
}

export default async function FaturalarSayfasi() {
  const supabase = await createClient();
  const bugun = new Date().toISOString().slice(0, 10);

  const [{ data: faturalar }, { data: musteriler }] = await Promise.all([
    supabase
      .from("faturalar")
      .select(
        "id, fatura_no, fatura_tarihi, vade_tarihi, tutar, kalan_bakiye, durum, musteriler ( unvan )"
      )
      .order("vade_tarihi", { ascending: true }),
    supabase.from("musteriler").select("id, unvan").order("unvan"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Faturalar</h1>
        <Link
          href="/panel/faturalar/ice-aktar"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          ⬆ Fatura içe aktar (XML/CSV)
        </Link>
      </div>

      <FaturaForm musteriler={musteriler ?? []} />

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Fatura no</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Vade</th>
              <th className="px-4 py-3 font-medium">Tutar</th>
              <th className="px-4 py-3 font-medium">Kalan</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(faturalar ?? []).map((fatura) => {
              const durumBilgi =
                DURUM_ETIKETLERI[fatura.durum] ?? DURUM_ETIKETLERI.acik;
              const gecikti =
                fatura.vade_tarihi < bugun &&
                (fatura.durum === "acik" || fatura.durum === "kismi");
              return (
                <tr key={fatura.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {fatura.fatura_no}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {(fatura.musteriler as unknown as { unvan: string } | null)
                      ?.unvan ?? "—"}
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      gecikti ? "font-medium text-red-600" : "text-zinc-600"
                    }`}
                  >
                    {tarihFormat(fatura.vade_tarihi)}
                    {gecikti && " ⚠"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {paraFormat(Number(fatura.tutar))}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {paraFormat(Number(fatura.kalan_bakiye))}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${durumBilgi.sinif}`}
                    >
                      {durumBilgi.etiket}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={faturaSil}>
                      <input type="hidden" name="id" value={fatura.id} />
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:underline"
                      >
                        Sil
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {(faturalar ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Henüz fatura yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
