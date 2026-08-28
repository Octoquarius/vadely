"use client";

import Link from "next/link";
import { useActionState } from "react";
import { pilotBasvur, type PilotDurum } from "./actions";

const baslangic: PilotDurum = {};

const girdiSinifi =
  "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none";

export default function PilotSayfasi() {
  const [durum, eylem, bekliyor] = useActionState(pilotBasvur, baslangic);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-zinc-900">
            Vadely
          </Link>
          <Link
            href="/kayit"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Start for free
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-900">
          Apply for the pilot program
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          In our first pilot phase, we work one-on-one with a limited number
          of SMEs: we upload your data together, set up your reminder plan
          together, and measure the change in your collection time together
          over 2-4 weeks. Usage during the pilot is{" "}
          <strong>free of charge</strong>.
        </p>

        {durum.mesaj ? (
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
            {durum.mesaj}
            <p className="mt-3">
              <Link href="/" className="font-medium underline">
                Back to home
              </Link>
            </p>
          </div>
        ) : (
          <form
            action={eylem}
            className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <div>
              <label
                htmlFor="sirket_adi"
                className="block text-sm font-medium text-zinc-700"
              >
                Company name
              </label>
              <input
                id="sirket_adi"
                name="sirket_adi"
                type="text"
                required
                maxLength={200}
                className={girdiSinifi}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="ad_soyad"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Full name
                </label>
                <input
                  id="ad_soyad"
                  name="ad_soyad"
                  type="text"
                  required
                  maxLength={200}
                  autoComplete="name"
                  className={girdiSinifi}
                />
              </div>
              <div>
                <label
                  htmlFor="telefon"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Phone <span className="text-zinc-400">(optional)</span>
                </label>
                <input
                  id="telefon"
                  name="telefon"
                  type="tel"
                  maxLength={40}
                  autoComplete="tel"
                  className={girdiSinifi}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="eposta"
                className="block text-sm font-medium text-zinc-700"
              >
                Work email
              </label>
              <input
                id="eposta"
                name="eposta"
                type="email"
                required
                maxLength={320}
                autoComplete="email"
                className={girdiSinifi}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="aylik_fatura_adedi"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Monthly sales invoices
                </label>
                <select
                  id="aylik_fatura_adedi"
                  name="aylik_fatura_adedi"
                  className={girdiSinifi}
                  defaultValue="20-100"
                >
                  <option value="0-20">0-20</option>
                  <option value="20-100">20-100</option>
                  <option value="100-500">100-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="kullanilan_yazilim"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Accounting software you use{" "}
                  <span className="text-zinc-400">(optional)</span>
                </label>
                <input
                  id="kullanilan_yazilim"
                  name="kullanilan_yazilim"
                  type="text"
                  maxLength={200}
                  placeholder="Paraşüt, Logo, Mikro, Excel…"
                  className={girdiSinifi}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="mesaj"
                className="block text-sm font-medium text-zinc-700"
              >
                What&apos;s your biggest challenge with collections?{" "}
                <span className="text-zinc-400">(optional)</span>
              </label>
              <textarea
                id="mesaj"
                name="mesaj"
                rows={3}
                maxLength={2000}
                className={girdiSinifi}
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
              className="w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {bekliyor ? "Submitting…" : "Submit pilot application"}
            </button>
            <p className="text-xs text-zinc-400">
              Your application information is used solely for evaluating the
              pilot program. Details:{" "}
              <a href="/gizlilik" target="_blank" className="underline">
                Privacy Notice
              </a>
              .
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
