import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { denemeKalanGun } from "@/lib/paketler";
import { cikisYap } from "@/app/(auth)/actions";

export default async function PanelYerlesimi({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/giris");
  }

  const { data: profil } = await supabase
    .from("kullanici_profilleri")
    .select("ad_soyad, rol, hesaplar ( ad, paket, created_at )")
    .eq("id", data.claims.sub)
    .single();

  const hesap = profil?.hesaplar as unknown as {
    ad: string;
    paket: string;
    created_at: string;
  } | null;
  const hesapAdi = hesap?.ad ?? "Hesabım";
  const denemede = hesap?.paket === "deneme";
  const kalanGun = hesap ? denemeKalanGun(hesap.created_at) : 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <Link href="/panel" className="text-lg font-bold text-zinc-900">
              Vadely
            </Link>
            <nav className="flex gap-4 text-sm text-zinc-600">
              <Link href="/panel" className="hover:text-zinc-900">
                Genel Bakış
              </Link>
              <Link href="/panel/musteriler" className="hover:text-zinc-900">
                Müşteriler
              </Link>
              <Link href="/panel/faturalar" className="hover:text-zinc-900">
                Faturalar
              </Link>
              <Link href="/panel/odemeler" className="hover:text-zinc-900">
                Ödemeler
              </Link>
              <Link href="/panel/hatirlatmalar" className="hover:text-zinc-900">
                Hatırlatmalar
              </Link>
              <Link href="/panel/gunluk" className="hover:text-zinc-900">
                Günlük
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {denemede && (
              <Link
                href="/panel/paket"
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  kalanGun > 0
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                {kalanGun > 0
                  ? `Deneme: ${kalanGun} gün kaldı`
                  : "Deneme bitti — paket seçin"}
              </Link>
            )}
            <Link
              href="/panel/ayarlar"
              className="text-zinc-500 hover:text-zinc-900"
              title="Ayarlar"
            >
              {hesapAdi} ⚙
            </Link>
            <form action={cikisYap}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-700 hover:bg-zinc-100"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
