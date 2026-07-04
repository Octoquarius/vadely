"use client";

import Link from "next/link";
import { useActionState } from "react";
import { sifreSifirlaIste, type AuthDurum } from "../actions";

const baslangic: AuthDurum = {};

export default function SifremiUnuttumSayfasi() {
  const [durum, eylem, bekliyor] = useActionState(sifreSifirlaIste, baslangic);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Şifremi unuttum</h1>
        <p className="mt-1 text-sm text-zinc-500">
          E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
        </p>

        <form action={eylem} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="eposta"
              className="block text-sm font-medium text-zinc-700"
            >
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
            {bekliyor ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          <Link href="/giris" className="font-medium text-zinc-900 underline">
            Girişe dön
          </Link>
        </p>
      </div>
    </main>
  );
}
