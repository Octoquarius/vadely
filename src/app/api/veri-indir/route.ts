import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// KVKK erişim/taşınabilirlik hakkı: oturumdaki kullanıcının tenant verisini
// tek JSON dosyası olarak indirir. RLS sayesinde yalnızca kendi hesabının
// verisi döner.
export async function GET() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return NextResponse.json({ hata: "oturum yok" }, { status: 401 });
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
    aciklama: "Vadely veri dışa aktarımı (KVKK erişim hakkı)",
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
      "Content-Disposition": `attachment; filename="vadely-veri-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}
