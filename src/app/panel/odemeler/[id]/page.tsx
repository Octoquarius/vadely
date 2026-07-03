import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { eslesmeKaldir } from "../actions";
import { EslestirSatiri } from "./eslestir-satiri";

function paraFormat(tutar: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(tutar);
}

function tarihFormat(tarih: string) {
  return new Date(tarih).toLocaleDateString("tr-TR");
}

export default async function OdemeDetaySayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: odeme } = await supabase
    .from("odemeler")
    .select(
      "id, tutar, odeme_tarihi, kaynak, aciklama, musteri_id, musteriler ( unvan )"
    )
    .eq("id", id)
    .single();

  if (!odeme) notFound();

  const [{ data: eslesmeler }, { data: acikFaturalar }] = await Promise.all([
    supabase
      .from("fatura_odeme_eslesmeleri")
      .select(
        "id, tutar, faturalar ( id, fatura_no, vade_tarihi, musteriler ( unvan ) )"
      )
      .eq("odeme_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("faturalar")
      .select(
        "id, fatura_no, vade_tarihi, kalan_bakiye, musteri_id, musteriler ( unvan )"
      )
      .in("durum", ["acik", "kismi"])
      .order("vade_tarihi", { ascending: true })
      .limit(100),
  ]);

  const eslesmisToplam = (eslesmeler ?? []).reduce(
    (toplam, eslesme) => toplam + Number(eslesme.tutar),
    0
  );
  const kalan = Number(odeme.tutar) - eslesmisToplam;

  // Ödemenin müşterisi belliyse onun faturaları öne, diğerleri sonra
  const siraliFaturalar = [...(acikFaturalar ?? [])].sort((a, b) => {
    if (!odeme.musteri_id) return 0;
    const aAyni = a.musteri_id === odeme.musteri_id ? 0 : 1;
    const bAyni = b.musteri_id === odeme.musteri_id ? 0 : 1;
    return aAyni - bAyni;
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/panel/odemeler"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Ödemeler
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
          Ödeme detayı
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Tutar</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">
            {paraFormat(Number(odeme.tutar))}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Eşleşmemiş</p>
          <p
            className={`mt-1 text-xl font-semibold ${
              kalan > 0 ? "text-amber-600" : "text-green-600"
            }`}
          >
            {paraFormat(kalan)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Tarih</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">
            {tarihFormat(odeme.odeme_tarihi)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Müşteri</p>
          <p className="mt-1 truncate text-xl font-semibold text-zinc-900">
            {(odeme.musteriler as unknown as { unvan: string } | null)?.unvan ??
              "—"}
          </p>
        </div>
      </div>

      {odeme.aciklama && (
        <p className="rounded-md bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
          {odeme.aciklama}
        </p>
      )}

      {(eslesmeler ?? []).length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Eşleşen faturalar
          </h2>
          <table className="mt-3 w-full text-left text-sm">
            <tbody>
              {(eslesmeler ?? []).map((eslesme) => {
                const fatura = eslesme.faturalar as unknown as {
                  fatura_no: string;
                  musteriler: { unvan: string } | null;
                } | null;
                return (
                  <tr key={eslesme.id} className="border-b border-zinc-100">
                    <td className="py-2 font-medium text-zinc-900">
                      {fatura?.fatura_no ?? "—"}
                    </td>
                    <td className="py-2 text-zinc-600">
                      {fatura?.musteriler?.unvan ?? "—"}
                    </td>
                    <td className="py-2 text-zinc-900">
                      {paraFormat(Number(eslesme.tutar))}
                    </td>
                    <td className="py-2 text-right">
                      <form action={eslesmeKaldir}>
                        <input
                          type="hidden"
                          name="eslesme_id"
                          value={eslesme.id}
                        />
                        <input type="hidden" name="odeme_id" value={odeme.id} />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:underline"
                        >
                          Eşleşmeyi kaldır
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {kalan > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Bu ödeme hangi faturayı kapatıyor?
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Açık faturalar vade sırasıyla listelendi
            {odeme.musteri_id && "; ödemenin müşterisine ait olanlar en üstte"}.
          </p>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="py-2 font-medium">Fatura no</th>
                <th className="py-2 font-medium">Müşteri</th>
                <th className="py-2 font-medium">Vade</th>
                <th className="py-2 font-medium">Kalan</th>
                <th className="py-2 text-right font-medium">Eşleştir</th>
              </tr>
            </thead>
            <tbody>
              {siraliFaturalar.map((fatura) => {
                const ayniMusteri =
                  odeme.musteri_id && fatura.musteri_id === odeme.musteri_id;
                return (
                  <tr
                    key={fatura.id}
                    className={`border-b border-zinc-100 ${
                      ayniMusteri ? "bg-emerald-50/40" : ""
                    }`}
                  >
                    <td className="py-2 font-medium text-zinc-900">
                      {fatura.fatura_no}
                    </td>
                    <td className="py-2 text-zinc-600">
                      {(fatura.musteriler as unknown as { unvan: string } | null)
                        ?.unvan ?? "—"}
                    </td>
                    <td className="py-2 text-zinc-600">
                      {tarihFormat(fatura.vade_tarihi)}
                    </td>
                    <td className="py-2 text-zinc-900">
                      {paraFormat(Number(fatura.kalan_bakiye))}
                    </td>
                    <td className="py-2">
                      <EslestirSatiri
                        odemeId={odeme.id}
                        faturaId={fatura.id}
                        onerilenTutar={Math.min(
                          Number(fatura.kalan_bakiye),
                          kalan
                        )}
                        azami={Math.min(Number(fatura.kalan_bakiye), kalan)}
                      />
                    </td>
                  </tr>
                );
              })}
              {siraliFaturalar.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-500">
                    Açık fatura yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
