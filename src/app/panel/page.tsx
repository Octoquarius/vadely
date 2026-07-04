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
  return new Date(`${ay}-01T00:00:00`).toLocaleDateString("tr-TR", {
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
    { baslik: "Açık alacak", deger: paraFormat(acikToplam) },
    {
      baslik: "Vadesi geçmiş",
      deger: paraFormat(gecikenToplam),
      vurgu: gecikenToplam > 0 ? ("kirmizi" as const) : undefined,
    },
    {
      baslik: "Gerçekleşen DSO (son 90 gün)",
      deger: dso === null ? "—" : `${dso} gün`,
      dipnot: dso === null ? "Henüz kapanan fatura yok" : "Tutar ağırlıklı",
    },
    {
      baslik: "Hatırlatma sonrası tahsilat",
      deger: paraFormat(nakit.toplam),
      dipnot:
        nakit.faturaAdedi > 0
          ? `${nakit.faturaAdedi} faturada, gönderimi izleyen 30 günde`
          : "Henüz hatırlatma sonrası tahsilat yok",
      vurgu: nakit.toplam > 0 ? ("yesil" as const) : undefined,
    },
  ];

  const adimlar = [
    {
      etiket: "Müşterinizi ekleyin",
      aciklama: "Elle girin ya da içe aktarmayla otomatik oluşsun",
      link: "/panel/musteriler",
      tamam: (musteriSayisi.count ?? 0) > 0,
    },
    {
      etiket: "Faturalarınızı yükleyin",
      aciklama: "e-Fatura XML veya CSV dökümünüzü içe aktarın",
      link: "/panel/faturalar/ice-aktar",
      tamam: (faturaSayisi.count ?? 0) > 0,
    },
    {
      etiket: "Hatırlatma planınızı üretin",
      aciklama: "Kadansı gözden geçirin, 'Planı şimdi üret' deyin",
      link: "/panel/hatirlatmalar",
      tamam: (hatirlatmaSayisi.count ?? 0) > 0,
    },
    {
      etiket: "İlk hatırlatmanızı gönderin",
      aciklama: "Önizleyin, e-posta ya da WhatsApp ile iletin",
      link: "/panel/hatirlatmalar",
      tamam: hatirlatmalar.length > 0,
    },
  ];
  const kurulumBitti = adimlar.every((adim) => adim.tamam);
  const ornekVeriVar = (ornekVeriSayisi.count ?? 0) > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Genel Bakış</h1>

      {ornekVeriVar && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            <strong>Örnek veriler yüklü.</strong> Panoyu keşfettikten sonra
            kendi verinizi yüklemeden önce temizleyin.
          </span>
          <form action={ornekVeriTemizle}>
            <button
              type="submit"
              className="rounded-md border border-amber-300 bg-white px-3 py-1.5 font-medium text-amber-800 hover:bg-amber-100"
            >
              Örnek verileri temizle
            </button>
          </form>
        </div>
      )}

      {!kurulumBitti && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Kuruluma devam edin (
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
              <span>Önce bir tur atmak mı istiyorsunuz?</span>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Örnek verilerle deneyin
              </button>
              <span className="text-xs text-zinc-400">
                6 müşteri, 14 fatura ve ödemeleriyle dolu bir pano — tek tıkla
                geri silinir.
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
        {/* Alacak yaşlandırma */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Alacak yaşlandırma
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Açık bakiye, vade gecikmesine göre
          </p>
          <div className="mt-4 space-y-3">
            {kovalar.map((kova) => (
              <div key={kova.etiket} title={`${kova.adet} fatura`}>
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

        {/* Aylık DSO trendi */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Aylık gerçekleşen DSO
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Kapanan faturaların tutar ağırlıklı tahsil süresi (gün)
          </p>
          <div className="mt-4 space-y-3">
            {dsoSerisi.map((nokta) => (
              <div
                key={nokta.ay}
                title={
                  nokta.adet > 0
                    ? `${nokta.adet} fatura kapandı`
                    : "Kapanan fatura yok"
                }
              >
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-zinc-600">{ayEtiketi(nokta.ay)}</span>
                  <span className="font-medium text-zinc-900">
                    {nokta.adet > 0 ? `${nokta.dso} gün` : "—"}
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
        {/* En riskli faturalar */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            En riskli 10 fatura
          </h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1.5 font-medium">Fatura</th>
                <th className="py-1.5 font-medium">Müşteri</th>
                <th className="py-1.5 text-right font-medium">Kalan</th>
                <th className="py-1.5 text-right font-medium">Gecikme</th>
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
                    {fatura.gecikme} gün
                  </td>
                </tr>
              ))}
              {enRiskliFaturalar.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-500">
                    Vadesi geçmiş fatura yok. 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* En riskli müşteriler */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            En riskli 10 müşteri
          </h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1.5 font-medium">Müşteri</th>
                <th className="py-1.5 text-right font-medium">Açık bakiye</th>
                <th className="py-1.5 text-right font-medium">Fatura</th>
                <th className="py-1.5 text-right font-medium">En uzun gecikme</th>
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
                    {musteri.enUzunGecikme} gün
                  </td>
                </tr>
              ))}
              {enRiskliMusteriler.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-500">
                    Geciken müşteri yok. 🎉
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
