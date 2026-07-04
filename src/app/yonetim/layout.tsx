import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cikisYap } from "@/app/(auth)/actions";

// Platform yönetim paneli: yalnızca platform_yoneticileri tablosundaki
// kullanıcılara açık. Yetki kontrolü hem burada (yönlendirme) hem de veriyi
// döndüren SECURITY DEFINER fonksiyonların içinde yapılır.
export default async function YonetimYerlesimi({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/giris");

  const { data: yonetici } = await supabase.rpc("yonetici_miyim");
  if (!yonetici) redirect("/panel");

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-900 text-zinc-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <Link href="/yonetim" className="flex items-center gap-2 font-bold">
              Vadely
              <span className="rounded-full bg-altin-parlak/20 px-2 py-0.5 text-xs font-medium text-altin-parlak">
                Yönetim
              </span>
            </Link>
            <nav className="flex gap-4 text-sm text-zinc-400">
              <Link href="/yonetim" className="hover:text-white">
                Genel Bakış
              </Link>
              <Link href="/yonetim/pilot" className="hover:text-white">
                Pilot Başvuruları
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/panel" className="text-zinc-400 hover:text-white">
              Panele dön
            </Link>
            <form action={cikisYap}>
              <button
                type="submit"
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-800"
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
