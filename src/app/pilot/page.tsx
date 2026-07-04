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
            Ücretsiz başla
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-900">
          Pilot programına başvurun
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          İlk pilot dönemimizde sınırlı sayıda KOBİ ile birebir çalışıyoruz:
          verinizi birlikte yüklüyor, hatırlatma planınızı birlikte kuruyor ve
          2-4 hafta boyunca tahsilat sürenizdeki değişimi birlikte ölçüyoruz.
          Pilot süresince kullanım <strong>ücretsizdir</strong>.
        </p>

        {durum.mesaj ? (
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
            {durum.mesaj}
            <p className="mt-3">
              <Link href="/" className="font-medium underline">
                Ana sayfaya dön
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
                Şirket adı
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
                  Ad soyad
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
                  Telefon <span className="text-zinc-400">(isteğe bağlı)</span>
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
                İş e-postası
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
                  Aylık satış faturası adedi
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
                  Kullandığınız ön muhasebe{" "}
                  <span className="text-zinc-400">(isteğe bağlı)</span>
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
                Tahsilatta en çok zorlandığınız şey nedir?{" "}
                <span className="text-zinc-400">(isteğe bağlı)</span>
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
              {bekliyor ? "Gönderiliyor…" : "Pilot başvurusu gönder"}
            </button>
            <p className="text-xs text-zinc-400">
              Başvuru bilgileriniz yalnızca pilot programı değerlendirmesi için
              kullanılır. Ayrıntılar:{" "}
              <a href="/gizlilik" target="_blank" className="underline">
                KVKK Aydınlatma Metni
              </a>
              .
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
