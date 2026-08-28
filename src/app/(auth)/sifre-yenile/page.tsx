"use client";

import { useActionState } from "react";
import { sifreGuncelle, type AuthDurum } from "../actions";

const baslangic: AuthDurum = {};

export default function SifreYenileSayfasi() {
  const [durum, eylem, bekliyor] = useActionState(sifreGuncelle, baslangic);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Set a new password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter a new password for your account.
        </p>

        <form action={eylem} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="sifre"
              className="block text-sm font-medium text-zinc-700"
            >
              New password <span className="text-zinc-400">(at least 8 characters)</span>
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
          <div>
            <label
              htmlFor="sifre_tekrar"
              className="block text-sm font-medium text-zinc-700"
            >
              New password (confirm)
            </label>
            <input
              id="sifre_tekrar"
              name="sifre_tekrar"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {durum.hata && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {durum.hata}
            </p>
          )}

          <button
            type="submit"
            disabled={bekliyor}
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {bekliyor ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}
