import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function paraFormat(tutar: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(tutar);
}

export default async function GenelBakis() {
  const supabase = await createClient();
  const bugun = new Date().toISOString().slice(0, 10);

  const [musteriSayisi, acikFaturalar, gecikenFaturalar] = await Promise.all([
    supabase.from("musteriler").select("id", { count: "exact", head: true }),
    supabase
      .from("faturalar")
      .select("kalan_bakiye")
      .in("durum", ["acik", "kismi"]),
    supabase
      .from("faturalar")
      .select("kalan_bakiye")
      .in("durum", ["acik", "kismi"])
      .lt("vade_tarihi", bugun),
  ]);

  const acikToplam = (acikFaturalar.data ?? []).reduce(
    (t, f) => t + Number(f.kalan_bakiye),
    0
  );
  const gecikenToplam = (gecikenFaturalar.data ?? []).reduce(
    (t, f) => t + Number(f.kalan_bakiye),
    0
  );

  const kartlar = [
    { baslik: "Müşteri", deger: String(musteriSayisi.count ?? 0) },
    { baslik: "Açık fatura", deger: String(acikFaturalar.data?.length ?? 0) },
    { baslik: "Açık alacak", deger: paraFormat(acikToplam) },
    {
      baslik: "Vadesi geçmiş alacak",
      deger: paraFormat(gecikenToplam),
      vurgu: gecikenToplam > 0,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Genel Bakış</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {kartlar.map((kart) => (
          <div
            key={kart.baslik}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <p className="text-sm text-zinc-500">{kart.baslik}</p>
            <p
              className={`mt-1 text-xl font-semibold ${
                kart.vurgu ? "text-red-600" : "text-zinc-900"
              }`}
            >
              {kart.deger}
            </p>
          </div>
        ))}
      </div>

      {(musteriSayisi.count ?? 0) === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <h2 className="text-lg font-medium text-zinc-900">
            Hoş geldiniz! 👋
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Başlamak için önce bir müşteri ekleyin, sonra faturalarını girin.
          </p>
          <Link
            href="/panel/musteriler"
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            İlk müşterini ekle
          </Link>
        </div>
      )}
    </div>
  );
}
