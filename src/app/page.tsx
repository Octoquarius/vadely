import Link from "next/link";

export default function AnaSayfa() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-zinc-900">Vadely</span>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/giris"
              className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100"
            >
              Giriş yap
            </Link>
            <Link
              href="/kayit"
              className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-700"
            >
              Ücretsiz başla
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 items-center">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Faturanızı siz kesin,
            <br />
            <span className="text-emerald-600">paranızı biz toplayalım.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
            Vadely, e-faturalarınızı takip eder, müşterilerinize nazik ama
            tutarlı ödeme hatırlatmaları gönderir ve alacaklarınızın ne zaman
            tahsil edileceğini önceden gösterir.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/kayit"
              className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              5 dakikada başlayın
            </Link>
            <Link
              href="/giris"
              className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Giriş yap
            </Link>
          </div>
          <p className="mt-10 text-sm text-zinc-500">
            Türkiye&apos;de ortalama alacak tahsil süresi 75 gün. Sizinki kaç
            gün?
          </p>
        </div>
      </main>
    </div>
  );
}
