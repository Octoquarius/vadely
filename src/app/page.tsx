import Link from "next/link";
import { PAKETLER } from "@/lib/paketler";

const OZELLIKLER = [
  {
    baslik: "Otomatik hatırlatma kadansı",
    aciklama:
      "Vadeden önce nazikçe, vadede net, gecikince kararlı — siz kural koyarsınız, Vadely takip eder.",
    ikon: "⏰",
  },
  {
    baslik: "e-Fatura / CSV içe aktarma",
    aciklama:
      "Entegratör portalınızdan indirdiğiniz UBL XML'leri veya ön muhasebe CSV dökümünüzü dakikalar içinde yükleyin.",
    ikon: "📥",
  },
  {
    baslik: "İlişkiyi bozmayan Türkçe şablonlar",
    aciklama:
      "Tehdit yok, utandırma yok. Nazik ama tutarlı; her mesajı göndermeden önce onaylayabilirsiniz.",
    ikon: "🤝",
  },
  {
    baslik: "DSO panosu",
    aciklama:
      "Ortalama tahsil süreniz, alacak yaşlandırması ve en riskli müşteriler tek ekranda.",
    ikon: "📊",
  },
  {
    baslik: "Banka ekstresi eşleştirme",
    aciklama:
      "Gelen ödemeleri yükleyin, hangi faturayı kapattığını iki tıkla işaretleyin — hatırlatmalar kendiliğinden durur.",
    ikon: "🏦",
  },
  {
    baslik: "WhatsApp desteği",
    aciklama:
      "Türkiye'de tahsilatın gerçek kanalı. Hazır mesajı tek dokunuşla WhatsApp'tan iletin.",
    ikon: "💬",
  },
];

const SSS = [
  {
    soru: "Muhasebe programımı değiştirmem gerekiyor mu?",
    yanit:
      "Hayır. Vadely, Paraşüt/Logo/Mikro gibi araçlarınızın yerine geçmez; onların ürettiği fatura verisinin üzerine tahsilat katmanı ekler. Faturanızı istediğiniz yerde kesin, parasını Vadely toplasın.",
  },
  {
    soru: "Müşterilerim rahatsız olmaz mı?",
    yanit:
      "Şablonlarımız 'ilişkiyi bozmadan tahsilat' ilkesiyle yazıldı: nazik, profesyonel ve her zaman çözüm kapısı açık. Üstelik varsayılan modda hiçbir mesaj siz onaylamadan gönderilmez.",
  },
  {
    soru: "Kurulum ne kadar sürer?",
    yanit:
      "Kayıt olun, fatura dökümünüzü (XML/CSV) yükleyin, hatırlatma planınızı üretin: ilk DSO panonuzu 5 dakikada görürsünüz. Banka/GİB API bağlantısı gerekmez.",
  },
  {
    soru: "Verilerim güvende mi?",
    yanit:
      "Veriler şifreli iletişimle taşınır, hesaplar birbirinden veritabanı seviyesinde yalıtılmıştır. KVKK gereği verinizi tek tıkla indirebilir veya kalıcı silebilirsiniz.",
  },
  {
    soru: "Fiyatlar neden USD?",
    yanit:
      "Altyapı maliyetlerimiz dövize endeksli olduğu için fiyat listesi USD'dir; tahsilat güncel kurdan TL karşılığıyla yapılır. Yıllık ödemede yaklaşık 2 ay bedavadır.",
  },
];

export default function AnaSayfa() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-zinc-900">Vadely</span>
          <nav className="flex items-center gap-3 text-sm">
            <a
              href="#fiyatlandirma"
              className="hidden px-2 text-zinc-600 hover:text-zinc-900 sm:block"
            >
              Fiyatlandırma
            </a>
            <a
              href="#sss"
              className="hidden px-2 text-zinc-600 hover:text-zinc-900 sm:block"
            >
              SSS
            </a>
            <Link
              href="/pilot"
              className="hidden px-2 text-zinc-600 hover:text-zinc-900 sm:block"
            >
              Pilot programı
            </Link>
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

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mx-auto mb-4 w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Kâğıt fatura bitti, e-fatura zorunlu — o veri artık sizin için
          çalışabilir
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Faturanızı siz kesin,
          <br />
          <span className="text-emerald-600">paranızı biz toplayalım.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
          Vadely, e-faturalarınızı takip eder, müşterilerinize nazik ama
          tutarlı ödeme hatırlatmaları gönderir ve alacaklarınızın durumunu
          tek panoda gösterir. Muhasebe programınıza rakip değil,
          tamamlayıcısıdır.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/kayit"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            14 gün ücretsiz deneyin
          </Link>
          <Link
            href="/giris"
            className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Giriş yap
          </Link>
        </div>
        <p className="mt-3 text-xs text-zinc-400">
          Kredi kartı gerekmez · 5 dakikada kurulum
        </p>
      </section>

      {/* İstatistik bandı */}
      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 text-center sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-zinc-900">75 gün</p>
            <p className="mt-1 text-sm text-zinc-500">
              Türkiye imalatta ortalama alacak tahsil süresi (TCMB, 2024)
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-zinc-900">3&apos;te 2</p>
            <p className="mt-1 text-sm text-zinc-500">
              B2B faturaların gecikmeli ödenme oranı (Atradius, 2025)
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-zinc-900">%82</p>
            <p className="mt-1 text-sm text-zinc-500">
              KOBİ başarısızlıklarında kötü nakit akışının payı
            </p>
          </div>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold text-zinc-900">
          Nasıl çalışır?
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              adim: "1",
              baslik: "Faturalarınızı yükleyin",
              aciklama:
                "e-Fatura XML veya CSV dökümünüzü sürükleyin; müşterileriniz otomatik oluşur.",
            },
            {
              adim: "2",
              baslik: "Kadansınızı kurun",
              aciklama:
                "Vadeden 3 gün önce mi, 7 gün sonra mı? Tonu ve zamanlamayı siz seçin — ya da hazır planı kullanın.",
            },
            {
              adim: "3",
              baslik: "Tahsilatı izleyin",
              aciklama:
                "Hatırlatmalar gider, ödemeler eşleşir, DSO panonuz her gün güncellenir.",
            },
          ].map((madde) => (
            <div
              key={madde.adim}
              className="rounded-xl border border-zinc-200 bg-white p-6"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                {madde.adim}
              </span>
              <h3 className="mt-3 font-semibold text-zinc-900">
                {madde.baslik}
              </h3>
              <p className="mt-1 text-sm text-zinc-600">{madde.aciklama}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Özellikler */}
      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-semibold text-zinc-900">
            Tahsilat için ihtiyacınız olan her şey
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {OZELLIKLER.map((ozellik) => (
              <div key={ozellik.baslik} className="rounded-xl bg-zinc-50 p-5">
                <span className="text-2xl">{ozellik.ikon}</span>
                <h3 className="mt-2 font-semibold text-zinc-900">
                  {ozellik.baslik}
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  {ozellik.aciklama}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fiyatlandırma */}
      <section id="fiyatlandirma" className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold text-zinc-900">
          Basit, öngörülebilir fiyatlandırma
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          14 gün ücretsiz deneme · Yıllık ödemede ~2 ay bedava · İstediğiniz an
          iptal
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PAKETLER.map((paket) => (
            <div
              key={paket.kod}
              className={`flex flex-col rounded-xl border bg-white p-6 ${
                paket.one_cikan
                  ? "border-emerald-400 shadow-sm"
                  : "border-zinc-200"
              }`}
            >
              {paket.one_cikan && (
                <span className="mb-2 w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  En çok tercih edilen
                </span>
              )}
              <h3 className="text-lg font-semibold text-zinc-900">
                {paket.ad}
              </h3>
              <p className="text-sm text-zinc-500">{paket.ozet}</p>
              <p className="mt-3">
                <span className="text-3xl font-bold text-zinc-900">
                  ${paket.aylikUsd}
                </span>
                <span className="text-sm text-zinc-500"> / ay</span>
                <span className="ml-2 text-xs text-zinc-400">
                  (yıllık ${paket.yillikUsd})
                </span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-zinc-600">
                {paket.ozellikler.map((ozellik) => (
                  <li key={ozellik} className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    {ozellik}
                  </li>
                ))}
              </ul>
              <Link
                href="/kayit"
                className={`mt-5 rounded-md px-4 py-2 text-center text-sm font-medium ${
                  paket.one_cikan
                    ? "bg-emerald-700 text-white hover:bg-emerald-600"
                    : "bg-zinc-900 text-white hover:bg-zinc-700"
                }`}
              >
                Ücretsiz dene
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-zinc-400">
          Fiyatlar USD&apos;dir; tahsilat TL karşılığıyla yapılır. SMS/WhatsApp
          mesajları kullandıkça öde kontör modeliyle ücretlendirilir.
        </p>
      </section>

      {/* SSS */}
      <section id="sss" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-2xl font-semibold text-zinc-900">
            Sık sorulan sorular
          </h2>
          <div className="mt-8 space-y-6">
            {SSS.map((madde) => (
              <div key={madde.soru}>
                <h3 className="font-semibold text-zinc-900">{madde.soru}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  {madde.yanit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kapanış CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Vadesi geçen her gün, paranızın maliyetidir.
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Türkiye&apos;de ortalama tahsil süresi 75 gün. Sizinki kaç gün?
          Panonuz 5 dakikada hazır.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/kayit"
            className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
          >
            14 gün ücretsiz deneyin
          </Link>
          <Link
            href="/pilot"
            className="rounded-md border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
          >
            Pilot programına başvurun
          </Link>
        </div>
        <p className="mt-3 text-xs text-zinc-400">
          Pilot programında sınırlı sayıda KOBİ ile ücretsiz, birebir
          çalışıyoruz.
        </p>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-zinc-500">
          <span>© 2026 Vadely</span>
          <nav className="flex gap-4">
            <Link href="/pilot" className="hover:text-zinc-900">
              Pilot programı
            </Link>
            <Link href="/gizlilik" className="hover:text-zinc-900">
              KVKK Aydınlatma Metni
            </Link>
            <Link href="/kullanim-kosullari" className="hover:text-zinc-900">
              Kullanım Koşulları
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
