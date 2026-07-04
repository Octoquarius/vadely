import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sablonUret } from "@/lib/eposta/sablonlar";
import {
  HATIRLATMA_DURUMLARI,
  SABLON_ETIKETLERI,
} from "@/lib/sabitler";
import {
  telefonNormallestir,
  waLinkUret,
  whatsappMesajUret,
} from "@/lib/whatsapp";
import { TekGonderDugmesi } from "./gonder-dugmesi";
import { WhatsappKarti } from "./whatsapp-karti";

function gecikmeGunuHesapla(vadeTarihi: string): number {
  const vade = new Date(`${vadeTarihi}T00:00:00Z`).getTime();
  const bugun = new Date(
    new Date().toISOString().slice(0, 10) + "T00:00:00Z"
  ).getTime();
  return Math.round((bugun - vade) / 86400000);
}

export default async function HatirlatmaOnizleme({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: hatirlatma }, { data: hesap }] = await Promise.all([
    supabase
      .from("hatirlatmalar")
      .select(
        "id, sablon_kodu, durum, hata, planlanan_zaman, gonderilen_zaman, faturalar ( fatura_no, fatura_tarihi, vade_tarihi, kalan_bakiye, para_birimi ), musteriler ( unvan, eposta, telefon, whatsapp )"
      )
      .eq("id", id)
      .single(),
    supabase.from("hesaplar").select("ad").single(),
  ]);

  if (!hatirlatma) notFound();

  const fatura = hatirlatma.faturalar as unknown as {
    fatura_no: string;
    fatura_tarihi: string;
    vade_tarihi: string;
    kalan_bakiye: number;
    para_birimi: string;
  } | null;
  const musteri = hatirlatma.musteriler as unknown as {
    unvan: string;
    eposta: string | null;
    telefon: string | null;
    whatsapp: string | null;
  } | null;

  if (!fatura || !musteri) notFound();

  const sablonGirdisi = {
    gonderenUnvan: hesap?.ad ?? "Şirketimiz",
    musteriUnvan: musteri.unvan,
    faturaNo: fatura.fatura_no,
    faturaTarihi: fatura.fatura_tarihi,
    vadeTarihi: fatura.vade_tarihi,
    kalanBakiye: Number(fatura.kalan_bakiye),
    paraBirimi: fatura.para_birimi,
    gecikmeGunu: gecikmeGunuHesapla(fatura.vade_tarihi),
  };

  const icerik = sablonUret(
    hatirlatma.sablon_kodu ?? "nazik_gecikme",
    sablonGirdisi
  );

  const waMesaj = whatsappMesajUret(
    hatirlatma.sablon_kodu ?? "nazik_gecikme",
    sablonGirdisi
  );
  const waNumara = telefonNormallestir(
    musteri.whatsapp ?? musteri.telefon ?? ""
  );
  const waLink = waNumara ? waLinkUret(waNumara, waMesaj) : null;

  const durumBilgi =
    HATIRLATMA_DURUMLARI[hatirlatma.durum] ?? HATIRLATMA_DURUMLARI.planlandi;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <Link
            href="/panel/hatirlatmalar"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            ← Hatırlatmalar
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
            E-posta önizlemesi
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {SABLON_ETIKETLERI[hatirlatma.sablon_kodu ?? ""] ??
              hatirlatma.sablon_kodu}{" "}
            · Alıcı: {musteri.eposta ?? "e-posta yok!"} ·{" "}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${durumBilgi.sinif}`}
            >
              {durumBilgi.etiket}
            </span>
          </p>
        </div>
        {hatirlatma.durum === "planlandi" && (
          <TekGonderDugmesi hatirlatmaId={hatirlatma.id} />
        )}
      </div>

      {hatirlatma.hata && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Son gönderim hatası: {hatirlatma.hata}
        </p>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-500">
          Konu:{" "}
          <span className="font-medium text-zinc-900">{icerik.konu}</span>
        </p>
      </div>

      <iframe
        srcDoc={icerik.html}
        sandbox=""
        title="E-posta önizlemesi"
        className="h-[560px] w-full rounded-xl border border-zinc-200 bg-white"
      />

      <WhatsappKarti
        hatirlatmaId={hatirlatma.id}
        mesaj={waMesaj}
        waLink={waLink}
        planlandi={hatirlatma.durum === "planlandi"}
      />
    </div>
  );
}
