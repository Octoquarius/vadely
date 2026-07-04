import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Ozet = {
  hesap_sayisi: number;
  kullanici_sayisi: number;
  musteri_sayisi: number;
  fatura_sayisi: number;
  acik_fatura_sayisi: number;
  acik_alacak_toplami: number;
  tahsil_edilen_toplami: number;
  hatirlatma_gonderilen: number;
  pilot_basvuru_sayisi: number;
};

type Hesap = {
  id: string;
  ad: string;
  paket: string;
  paket_donemi: string;
  created_at: string;
  sahip_eposta: string | null;
  kullanici_sayisi: number;
  musteri_sayisi: number;
  fatura_sayisi: number;
  acik_alacak: number;
};

function tl(tutar: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(tutar);
}

function tarih(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PAKET_ETIKET: Record<string, string> = {
  deneme: "Deneme",
  baslangic: "Başlangıç",
  profesyonel: "Profesyonel",
  isletme: "İşletme",
};

function IstatistikKarti({
  baslik,
  deger,
  alt,
}: {
  baslik: string;
  deger: string;
  alt?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {baslik}
      </p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{deger}</p>
      {alt && <p className="mt-0.5 text-xs text-zinc-500">{alt}</p>}
    </div>
  );
}

export default async function YonetimGenelBakis() {
  const supabase = await createClient();
  const [{ data: ozetVeri }, { data: hesapVeri }] = await Promise.all([
    supabase.rpc("yonetim_ozet"),
    supabase.rpc("yonetim_hesaplar"),
  ]);

  const ozet = ozetVeri as Ozet | null;
  const hesaplar = (hesapVeri as Hesap[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Genel Bakış</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tüm kiracılar genelinde platform metrikleri.
        </p>
      </div>

      {ozet && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <IstatistikKarti
            baslik="Hesap"
            deger={String(ozet.hesap_sayisi)}
            alt={`${ozet.kullanici_sayisi} kullanıcı`}
          />
          <IstatistikKarti
            baslik="Açık alacak"
            deger={tl(ozet.acik_alacak_toplami)}
            alt={`${ozet.acik_fatura_sayisi} açık fatura`}
          />
          <IstatistikKarti
            baslik="Tahsil edilen"
            deger={tl(ozet.tahsil_edilen_toplami)}
          />
          <IstatistikKarti
            baslik="Müşteri"
            deger={String(ozet.musteri_sayisi)}
          />
          <IstatistikKarti
            baslik="Fatura"
            deger={String(ozet.fatura_sayisi)}
          />
          <IstatistikKarti
            baslik="Gönderilen hatırlatma"
            deger={String(ozet.hatirlatma_gonderilen)}
          />
          <IstatistikKarti
            baslik="Pilot başvuru"
            deger={String(ozet.pilot_basvuru_sayisi)}
          />
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">
            Hesaplar ({hesaplar.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-2 font-medium">Şirket</th>
                <th className="px-4 py-2 font-medium">Sahip</th>
                <th className="px-4 py-2 font-medium">Paket</th>
                <th className="px-4 py-2 text-right font-medium">Müşteri</th>
                <th className="px-4 py-2 text-right font-medium">Fatura</th>
                <th className="px-4 py-2 text-right font-medium">Açık alacak</th>
                <th className="px-4 py-2 font-medium">Kayıt</th>
              </tr>
            </thead>
            <tbody>
              {hesaplar.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50"
                >
                  <td className="px-4 py-2.5 font-medium text-zinc-900">
                    {h.ad}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600">
                    {h.sahip_eposta ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600">
                    {PAKET_ETIKET[h.paket] ?? h.paket}
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-600">
                    {h.musteri_sayisi}
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-600">
                    {h.fatura_sayisi}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-zinc-900">
                    {tl(h.acik_alacak)}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500">
                    {tarih(h.created_at)}
                  </td>
                </tr>
              ))}
              {hesaplar.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-zinc-500"
                  >
                    Henüz hesap yok.
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
