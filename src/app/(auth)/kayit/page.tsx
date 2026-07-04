"use client";

import Link from "next/link";
import { useActionState } from "react";
import { kayitOl, type AuthDurum } from "../actions";

const baslangic: AuthDurum = {};

export default function KayitSayfasi() {
  const [durum, eylem, bekliyor] = useActionState(kayitOl, baslangic);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">
          Vadely hesabı oluştur
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          5 dakikada alacak takibinize başlayın.
        </p>

        <form action={eylem} className="mt-6 space-y-4">
          <div>
            <label htmlFor="sirket_adi" className="block text-sm font-medium text-zinc-700">
              Şirket adı
            </label>
            <input
              id="sirket_adi"
              name="sirket_adi"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="ad_soyad" className="block text-sm font-medium text-zinc-700">
              Ad soyad
            </label>
            <input
              id="ad_soyad"
              name="ad_soyad"
              type="text"
              required
              autoComplete="name"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="eposta" className="block text-sm font-medium text-zinc-700">
              E-posta
            </label>
            <input
              id="eposta"
              name="eposta"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="sifre" className="block text-sm font-medium text-zinc-700">
              Şifre <span className="text-zinc-400">(en az 8 karakter)</span>
            </label>
            <input
              id="sifre"
              name="sifre"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-zinc-600">
            <input
              type="checkbox"
              name="kvkk_onay"
              value="evet"
              required
              className="mt-0.5"
            />
            <span>
              <a
                href="/kullanim-kosullari"
                target="_blank"
                className="underline"
              >
                Kullanım Koşulları
              </a>
              &apos;nı ve{" "}
              <a href="/gizlilik" target="_blank" className="underline">
                KVKK Aydınlatma Metni
              </a>
              &apos;ni okudum, kabul ediyorum.
            </span>
          </label>

          {durum.hata && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {durum.hata}
            </p>
          )}
          {durum.mesaj && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              {durum.mesaj}
            </p>
          )}

          <button
            type="submit"
            disabled={bekliyor}
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {bekliyor ? "Kayıt oluşturuluyor…" : "Kayıt ol"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="font-medium text-zinc-900 underline">
            Giriş yapın
          </Link>
        </p>
      </div>
    </main>
  );
}
