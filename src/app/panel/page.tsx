import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ornekVeriTemizle, ornekVeriYukle } from "./actions";
import {
  aylikDsoSerisi,
  gerceklesenDso,
  oneCekilenNakit,
  riskliFaturalar,
  riskliMusteriler,
  yaslandirmaHesapla,
  type AcikFatura,
  type GonderilmisHatirlatma,
  type KapanmaKaydi,
} from "@/lib/pano";

function paraFormat(tutar: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(tutar);
}

function ayEtiketi(ay: string) {
  return new Date(`${ay}-01T00:00:00`).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

export default async function GenelBakis() {
  const supabase = await createClient();
  const bugun = new Date().toISOString().slice(0, 10);

  const [
    acikSorgu,
    kapanmaSorgu,
    hatirlatmaSorgu,
    musteriSayisi,
    faturaSayisi,
    hatirlatmaSayisi,
    ornekVeriSayisi,
  ] = await Promise.all([
      supabase
        .from("faturalar")
        .select(
          "id, musteri_id, fatura_no, fatura_tarihi, vade_tarihi, kalan_bakiye, musteriler ( unvan )"
        )
        .in("durum", ["acik", "kismi"]),
      supabase
        .from("fatura_odeme_eslesmeleri")
        .select(
          "tutar, odemeler ( odeme_tarihi ), faturalar!inner ( id, fatura_tarihi, tutar, durum )"
        ),
      supabase
        .from("hatirlatmalar")
        .select("fatura_id, gonderilen_zaman")
        .not("gonderilen_zaman", "is", null),
      supabase.from("musteriler").select("id", { count: "exact", head: true }),
      supabase.from("faturalar").select("id", { count: "exact", head: true }),
      supabase
        .from("hatirlatmalar")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("musteriler")
        .select("id", { count: "exact", head: true })
        .eq("notlar", "ornek-veri"),
    ]);

  const acikFaturalar: AcikFatura[] = (acikSorgu.data ?? []).map((fatura) => ({
    id: fatura.id,
    musteri_id: fatura.musteri_id,
    musteri_unvan:
      (fatura.musteriler as unknown as { unvan: string } | null)?.unvan ?? "—",
    fatura_no: fatura.fatura_no,
    fatura_tarihi: fatura.fatura_tarihi,
    vade_tarihi: fatura.vade_tarihi,
    kalan_bakiye: Number(fatura.kalan_bakiye),
  }));

  type KapanmaKaydiDurumlu = KapanmaKaydi & { durum: string };
  const kapanmaKayitlari: KapanmaKaydiDurumlu[] = (
    kapanmaSorgu.data ?? []
  ).flatMap((eslesme) => {
      const fatura = eslesme.faturalar as unknown as {
        id: string;
        fatura_tarihi: string;
        tutar: number;
        durum: string;
      } | null;
      const odeme = eslesme.odemeler as unknown as {
        odeme_tarihi: string;
      } | null;
      if (!fatura || !odeme) return [];
      return [
        {
          fatura_id: fatura.id,
          fatura_tarihi: fatura.fatura_tarihi,
          fatura_tutari: Number(fatura.tutar),
          odeme_tarihi: odeme.odeme_tarihi,
          eslesme_tutari: Number(eslesme.tutar),
          durum: fatura.durum,
        },
      ];
  });

  const kapanmisKayitlar = kapanmaKayitlari.filter(
    (kayit) => kayit.durum === "kapali"
  );

  const hatirlatmalar: GonderilmisHatirlatma[] = (
    hatirlatmaSorgu.data ?? []
  ).map((h) => ({
    fatura_id: h.fatura_id,
    gonderilen_zaman: h.gonderilen_zaman as string,
  }));

  const acikToplam = acikFaturalar.reduce((t, f) => t + f.kalan_bakiye, 0);
  const kovalar = yaslandirmaHesapla(acikFaturalar, bugun);
  const gecikenToplam = kovalar.slice(1).reduce((t, k) => t + k.toplam, 0);
  const dso = gerceklesenDso(kapanmisKayitlar, bugun);
  const dsoSerisi = aylikDsoSerisi(kapanmisKayitlar, bugun);
  const nakit = oneCekilenNakit(kapanmaKayitlari, hatirlatmalar);
  const enRiskliFaturalar = riskliFaturalar(acikFaturalar, bugun);
  const enRiskliMusteriler = riskliMusteriler(acikFaturalar, bugun);

  const enBuyukKova = Math.max(...kovalar.map((k) => k.toplam), 1);
  const enBuyukDso = Math.max(...dsoSerisi.map((n) => n.dso), 1);

  const kartlar = [
    { baslik: "Open receivables", deger: paraFormat(acikToplam) },
    {
      baslik: "Past due",
      deger: paraFormat(gecikenToplam),
      vurgu: gecikenToplam > 0 ? ("kirmizi" as const) : undefined,
    },
    {
      baslik: "Realized DSO (last 90 days)",
      deger: dso === null ? "—" : `${dso} days`,
      dipnot: dso === null ? "No closed invoices yet" : "Amount-weighted",
    },
    {
      baslik: "Collections after reminder",
      deger: paraFormat(nakit.toplam),
      dipnot:
        nakit.faturaAdedi > 0
          ? `${nakit.faturaAdedi} invoices, within 30 days of sending`
          : "No collections after a reminder yet",
      vurgu: nakit.toplam > 0 ? ("yesil" as const) : undefined,
    },
  ];

  const adimlar = [
    {
      etiket: "Add your customers",
      aciklama: "Enter manually or let import create them automatically",
      link: "/panel/musteriler",
      tamam: (musteriSayisi.count ?? 0) > 0,
    },
    {
      etiket: "Upload your invoices",
      aciklama: "Import your e-Invoice XML or CSV export",
      link: "/panel/faturalar/ice-aktar",
      tamam: (faturaSayisi.count ?? 0) > 0,
    },
    {
      etiket: "Generate your reminder plan",
      aciklama: "Review the cadence, then click 'Generate plan now'",
      link: "/panel/hatirlatmalar",
      tamam: (hatirlatmaSayisi.count ?? 0) > 0,
    },
    {
      etiket: "Send your first reminder",
      aciklama: "Preview it, then deliver by email or WhatsApp",
      link: "/panel/hatirlatmalar",
      tamam: hatirlatmalar.length > 0,
    },
  ];
  const kurulumBitti = adimlar.every((adim) => adim.tamam);
  const ornekVeriVar = (ornekVeriSayisi.count ?? 0) > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Overview</h1>

      {ornekVeriVar && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            <strong>Sample data is loaded.</strong> After exploring the
            dashboard, clear it before uploading your own data.
          </span>
          <form action={ornekVeriTemizle}>
            <button
              type="submit"
              className="rounded-md border border-amber-300 bg-white px-3 py-1.5 font-medium text-amber-800 hover:bg-amber-100"
            >
              Clear sample data
            </button>
          </form>
        </div>
      )}

      {!kurulumBitti && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Continue setup (
            {adimlar.filter((adim) => adim.tamam).length}/{adimlar.length})
          </h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {adimlar.map((adim) => (
              <Link
                key={adim.etiket}
                href={adim.link}
                className={`flex items-start gap-3 rounded-lg border bg-white p-3 text-sm ${
                  adim.tamam
                    ? "border-zinc-200 opacity-60"
                    : "border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    adim.tamam
                      ? "bg-emerald-600 text-white"
                      : "border-2 border-zinc-300 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span>
                  <span
                    className={`font-medium ${
                      adim.tamam
                        ? "text-zinc-500 line-through"
                        : "text-zinc-900"
                    }`}
                  >
                    {adim.etiket}
                  </span>
                  <br />
                  <span className="text-zinc-500">{adim.aciklama}</span>
                </span>
              </Link>
            ))}
          </div>
          {!ornekVeriVar && (faturaSayisi.count ?? 0) === 0 && (
            <form
              action={ornekVeriYukle}
              className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-600"
            >
              <span>Want to take a look around first?</span>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Try it with sample data
              </button>
              <span className="text-xs text-zinc-400">
                A dashboard filled with 6 customers, 14 invoices and their
                payments — removed again with a single click.
              </span>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kartlar.map((kart) => (
          <div
            key={kart.baslik}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <p className="text-sm text-zinc-500">{kart.baslik}</p>
            <p
              className={`mt-1 text-xl font-semibold ${
                kart.vurgu === "kirmizi"
                  ? "text-red-600"
                  : kart.vurgu === "yesil"
                    ? "text-emerald-700"
                    : "text-zinc-900"
              }`}
            >
              {kart.deger}
            </p>
            {kart.dipnot && (
              <p className="mt-1 text-xs text-zinc-400">{kart.dipnot}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Receivables aging */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Receivables aging
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Open balance, by days past due
          </p>
          <div className="mt-4 space-y-3">
            {kovalar.map((kova) => (
              <div key={kova.etiket} title={`${kova.adet} invoices`}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-zinc-600">{kova.etiket}</span>
                  <span className="font-medium text-zinc-900">
                    {kova.toplam > 0 ? paraFormat(kova.toplam) : "—"}
                  </span>
                </div>
                <div className="mt-1 h-2.5 w-full rounded-full bg-zinc-100">
                  <div
                    className="h-2.5 rounded-full bg-zinc-700"
                    style={{
                      width: `${Math.max(
                        kova.toplam > 0 ? 2 : 0,
                        (kova.toplam / enBuyukKova) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly DSO trend */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Monthly realized DSO
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Amount-weighted collection time for closed invoices (days)
          </p>
          <div className="mt-4 space-y-3">
            {dsoSerisi.map((nokta) => (
              <div
                key={nokta.ay}
                title={
                  nokta.adet > 0
                    ? `${nokta.adet} invoices closed`
                    : "No invoices closed"
                }
              >
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-zinc-600">{ayEtiketi(nokta.ay)}</span>
                  <span className="font-medium text-zinc-900">
                    {nokta.adet > 0 ? `${nokta.dso} days` : "—"}
                  </span>
                </div>
                <div className="mt-1 h-2.5 w-full rounded-full bg-zinc-100">
                  <div
                    className="h-2.5 rounded-full bg-emerald-600"
                    style={{
                      width: `${Math.max(
                        nokta.adet > 0 ? 2 : 0,
                        (nokta.dso / enBuyukDso) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Highest-risk invoices */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Top 10 riskiest invoices
          </h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1.5 font-medium">Invoice</th>
                <th className="py-1.5 font-medium">Customer</th>
                <th className="py-1.5 text-right font-medium">Remaining</th>
                <th className="py-1.5 text-right font-medium">Overdue</th>
              </tr>
            </thead>
            <tbody>
              {enRiskliFaturalar.map((fatura) => (
                <tr key={fatura.id} className="border-t border-zinc-100">
                  <td className="py-2 font-medium text-zinc-900">
                    {fatura.fatura_no}
                  </td>
                  <td className="max-w-40 truncate py-2 text-zinc-600">
                    {fatura.musteri_unvan}
                  </td>
                  <td className="py-2 text-right text-zinc-900">
                    {paraFormat(fatura.kalan_bakiye)}
                  </td>
                  <td className="py-2 text-right font-medium text-red-600">
                    {fatura.gecikme} days
                  </td>
                </tr>
              ))}
              {enRiskliFaturalar.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-500">
                    No overdue invoices. 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Highest-risk customers */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Top 10 riskiest customers
          </h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1.5 font-medium">Customer</th>
                <th className="py-1.5 text-right font-medium">Open balance</th>
                <th className="py-1.5 text-right font-medium">Invoices</th>
                <th className="py-1.5 text-right font-medium">Longest overdue</th>
              </tr>
            </thead>
            <tbody>
              {enRiskliMusteriler.map((musteri) => (
                <tr
                  key={musteri.musteri_id}
                  className="border-t border-zinc-100"
                >
                  <td className="max-w-44 truncate py-2 font-medium text-zinc-900">
                    {musteri.unvan}
                  </td>
                  <td className="py-2 text-right text-zinc-900">
                    {paraFormat(musteri.acikBakiye)}
                  </td>
                  <td className="py-2 text-right text-zinc-600">
                    {musteri.faturaAdedi}
                  </td>
                  <td className="py-2 text-right font-medium text-red-600">
                    {musteri.enUzunGecikme} days
                  </td>
                </tr>
              ))}
              {enRiskliMusteriler.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-500">
                    No customers past due. 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
