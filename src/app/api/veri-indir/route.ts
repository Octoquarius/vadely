import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// KVKK access/portability right: downloads the signed-in user's tenant data
// as a single JSON file. Thanks to RLS, only their own account's data is
// returned.
export async function GET() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return NextResponse.json({ hata: "no session" }, { status: 401 });
  }

  const [hesap, musteriler, faturalar, odemeler, eslesmeler, hatirlatmalar, gunluk] =
    await Promise.all([
      supabase.from("hesaplar").select("*").single(),
      supabase.from("musteriler").select("*"),
      supabase.from("faturalar").select("*"),
      supabase.from("odemeler").select("*"),
      supabase.from("fatura_odeme_eslesmeleri").select("*"),
      supabase.from("hatirlatmalar").select("*"),
      supabase.from("olay_gunlugu").select("*"),
    ]);

  const disaAktarim = {
    aciklama: "Vadely data export (KVKK access right)",
    tarih: new Date().toISOString(),
    hesap: hesap.data,
    musteriler: musteriler.data ?? [],
    faturalar: faturalar.data ?? [],
    odemeler: odemeler.data ?? [],
    fatura_odeme_eslesmeleri: eslesmeler.data ?? [],
    hatirlatmalar: hatirlatmalar.data ?? [],
    olay_gunlugu: gunluk.data ?? [],
  };

  return new NextResponse(JSON.stringify(disaAktarim, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="vadely-data-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}
