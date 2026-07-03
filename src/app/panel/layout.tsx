import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    .select("ad_soyad, rol, hesaplar ( ad )")
    .eq("id", data.claims.sub)
    .single();

  const hesapAdi =
    (profil?.hesaplar as unknown as { ad: string } | null)?.ad ?? "Hesabım";

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
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500">{hesapAdi}</span>
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
