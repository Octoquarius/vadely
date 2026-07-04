import Link from "next/link";
import { PAKETLER } from "@/lib/paketler";

const NASIL = [
  {
    baslik: "Faturalarınızı yükleyin",
    aciklama:
      "e-Fatura XML veya CSV dökümünüzü sürükleyin; müşterileriniz otomatik oluşur.",
  },
  {
    baslik: "Kadansınızı kurun",
    aciklama:
      "Vadeden üç gün önce mi, yedi gün sonra mı? Tonu ve zamanlamayı siz seçin — ya da hazır planı kullanın.",
  },
  {
    baslik: "Tahsilatı izleyin",
    aciklama:
      "Hatırlatmalar gider, ödemeler eşleşir, tahsilat panonuz her gün güncellenir.",
  },
];

const OZELLIKLER: { baslik: string; aciklama: string; cizim: React.ReactNode }[] =
  [
    {
      baslik: "Otomatik hatırlatma kadansı",
      aciklama:
        "Vadeden önce nazikçe, vadede net, gecikince kararlı. Siz kural koyarsınız, Vadely takip eder.",
      cizim: (
        <path d="M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z" />
      ),
    },
    {
      baslik: "e-Fatura & CSV içe aktarma",
      aciklama:
        "Entegratör portalınızdan indirdiğiniz UBL XML'leri ya da ön muhasebe dökümünüzü dakikalar içinde yükleyin.",
      cizim: <path d="M12 3v11m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />,
    },
    {
      baslik: "İlişkiyi bozmayan şablonlar",
      aciklama:
        "Tehdit yok, utandırma yok. Nazik ama tutarlı; her mesajı göndermeden önce onaylayabilirsiniz.",
      cizim: <path d="M4 5h16v11H8l-4 4V5z" />,
    },
    {
      baslik: "Tahsilat panosu",
      aciklama:
        "Ortalama tahsil süreniz, alacak yaşlandırması ve en riskli müşteriler tek ekranda.",
      cizim: <path d="M4 20V4m0 16h16M8 16v-4m4 4V8m4 8v-6" />,
    },
    {
      baslik: "Banka ekstresi eşleştirme",
      aciklama:
        "Gelen ödemeleri yükleyin, hangi faturayı kapattığını iki tıkla işaretleyin; hatırlatmalar kendiliğinden durur.",
      cizim: <path d="M3 10l9-6 9 6M5 10v9h14v-9M9 19v-5h6v5" />,
    },
    {
      baslik: "WhatsApp desteği",
      aciklama:
        "Türkiye'de tahsilatın gerçek kanalı. Hazır mesajı tek dokunuşla WhatsApp'tan iletin.",
      cizim: <path d="M4 20l1.5-4A8 8 0 1112 20a8 8 0 01-4-1L4 20z" />,
    },
  ];

const SSS = [
  {
    soru: "Muhasebe programımı değiştirmem gerekiyor mu?",
    yanit:
      "Hayır. Vadely; Paraşüt, Logo ya da Mikro gibi araçlarınızın yerine geçmez, onların ürettiği fatura verisinin üzerine bir tahsilat katmanı ekler. Faturanızı istediğiniz yerde kesin, parasını Vadely toplasın.",
  },
  {
    soru: "Müşterilerim rahatsız olmaz mı?",
    yanit:
      "Şablonlarımız ilişkiyi bozmadan tahsilat ilkesiyle yazıldı: nazik, profesyonel, her zaman çözüm kapısı açık. Üstelik varsayılan modda hiçbir mesaj siz onaylamadan gönderilmez.",
  },
  {
    soru: "Kurulum ne kadar sürer?",
    yanit:
      "Kayıt olun, fatura dökümünüzü (XML veya CSV) yükleyin, hatırlatma planınızı üretin. İlk panonuzu beş dakikada görürsünüz; banka ya da GİB API bağlantısı gerekmez.",
  },
  {
    soru: "Verilerim güvende mi?",
    yanit:
      "Veriler şifreli iletişimle taşınır, hesaplar birbirinden veritabanı seviyesinde yalıtılmıştır. KVKK gereği verinizi tek tıkla indirebilir veya kalıcı olarak silebilirsiniz.",
  },
  {
    soru: "Fiyatlar neden dolar cinsinden?",
    yanit:
      "Altyapı maliyetlerimiz dövize endeksli olduğu için fiyat listesi USD'dir; tahsilat güncel kurdan TL karşılığıyla yapılır. Yıllık ödemede yaklaşık iki ay bedavadır.",
  },
];

function Isaret({ boyut = 34 }: { boyut?: number }) {
  return (
    <svg width={boyut} height={boyut} viewBox="0 0 60 60" fill="none" aria-hidden>
      <path
        d="M12 30 L25 43 L40 20"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="45.5" cy="17.5" r="9.5" fill="var(--color-altin-parlak)" />
    </svg>
  );
}

export default function AnaSayfa() {
  return (
    <div className="min-h-screen bg-kagit">
      <style>{`
        @keyframes lp-yukari { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
        @keyframes lp-buyu { from { transform:scaleX(0) } to { transform:scaleX(1) } }
        @keyframes lp-kon { 0%{ opacity:0; transform:translateY(-10px) scale(.6) } 70%{ transform:translateY(2px) scale(1.05) } 100%{ opacity:1; transform:none } }
        .lp-in { opacity:0; animation: lp-yukari .7s cubic-bezier(.22,.61,.36,1) forwards }
        .lp-d1{ animation-delay:.08s } .lp-d2{ animation-delay:.16s } .lp-d3{ animation-delay:.24s } .lp-d4{ animation-delay:.34s }
        .lp-cizgi-dolgu { transform-origin:left; animation: lp-buyu 1.1s .5s cubic-bezier(.65,0,.35,1) both }
        .lp-sikke { animation: lp-kon .5s 1.35s cubic-bezier(.34,1.56,.64,1) both }
        @media (prefers-reduced-motion: reduce) {
          .lp-in,.lp-cizgi-dolgu,.lp-sikke { animation:none; opacity:1; transform:none }
        }
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-20 border-b border-cizgi bg-kagit/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 text-murekkep">
            <Isaret boyut={26} />
            <span className="font-display text-[22px] font-semibold tracking-tight">
              vadely<span className="text-altin">.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm text-murekkep-2 md:flex">
            <a href="#nasil" className="rounded-md px-3 py-2 hover:bg-kart">Nasıl çalışır</a>
            <a href="#fiyat" className="rounded-md px-3 py-2 hover:bg-kart">Fiyatlandırma</a>
            <a href="#sss" className="rounded-md px-3 py-2 hover:bg-kart">SSS</a>
            <Link href="/pilot" className="rounded-md px-3 py-2 hover:bg-kart">Pilot programı</Link>
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/giris" className="rounded-lg px-3 py-2 font-medium text-murekkep hover:bg-kart">
              Giriş yap
            </Link>
            <Link
              href="/kayit"
              className="rounded-lg bg-murekkep px-4 py-2 font-medium text-kagit transition-colors hover:bg-[#123a33]"
            >
              Ücretsiz başla
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <p className="lp-in flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[.18em] text-altin">
            <span className="h-px w-6 bg-altin" />
            e-Fatura çağında tahsilat
          </p>
          <h1 className="lp-in lp-d1 mt-6 font-display text-[clamp(38px,6vw,62px)] font-semibold leading-[1.05] tracking-[-.02em] text-murekkep text-balance">
            Faturanızı siz kesin,{" "}
            <span className="italic text-altin">paranızı biz toplayalım.</span>
          </h1>
          <p className="lp-in lp-d2 mt-6 max-w-xl text-lg leading-relaxed text-murekkep-2">
            Vadely e-faturalarınızı takip eder, müşterilerinize nazik ama tutarlı
            ödeme hatırlatmaları gönderir ve alacaklarınızı tek panoda toplar.
            Muhasebe programınıza rakip değil, tamamlayıcısıdır.
          </p>
          <div className="lp-in lp-d3 mt-8 flex flex-wrap gap-3">
            <Link
              href="/kayit"
              className="rounded-xl bg-murekkep px-6 py-3.5 text-sm font-semibold text-kagit transition-colors hover:bg-[#123a33]"
            >
              14 gün ücretsiz deneyin
            </Link>
            <Link
              href="/giris"
              className="rounded-xl border border-cizgi bg-kart px-6 py-3.5 text-sm font-semibold text-murekkep transition-colors hover:border-murekkep-2"
            >
              Giriş yap
            </Link>
          </div>
          <p className="lp-in lp-d4 mt-4 font-mono text-xs text-sis">
            Kredi kartı gerekmez · 5 dakikada kurulum
          </p>
        </div>

        {/* Signature: olgunlaşan fatura */}
        <div className="lp-in lp-d2 relative">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(120%_100%_at_70%_0%,rgba(227,169,58,.18),transparent_60%)]"
          />
          <FaturaKarti />
        </div>
      </section>

      {/* İSTATİSTİK BANDI (koyu çam) */}
      <section className="bg-murekkep text-kagit">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
          {[
            ["75 gün", "Türkiye imalatında ortalama alacak tahsil süresi", "TCMB, 2024"],
            ["3'te 2", "B2B faturaların gecikmeli ödenme oranı", "Atradius, 2025"],
            ["%82", "KOBİ başarısızlıklarında kötü nakit akışının payı", "—"],
          ].map(([buyuk, alt, kaynak]) => (
            <div key={alt} className="border-t border-white/15 pt-5">
              <p className="font-mono text-4xl font-semibold tracking-tight text-altin-parlak">
                {buyuk}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-kagit/80">{alt}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-kagit/40">
                {kaynak}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* NASIL ÇALIŞIR — gerçek bir sıra, bu yüzden numaralı */}
      <section id="nasil" className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-medium uppercase tracking-[.18em] text-altin">
            Nasıl çalışır
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-murekkep sm:text-4xl">
            Üç adımda ilk panonuz
          </h2>
        </div>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {NASIL.map((adim, i) => (
            <li key={adim.baslik} className="rounded-2xl border border-cizgi bg-kart p-7">
              <span className="font-mono text-sm font-semibold text-altin">
                0{i + 1}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-murekkep">
                {adim.baslik}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-murekkep-2">
                {adim.aciklama}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ÖZELLİKLER */}
      <section className="border-y border-cizgi bg-kart/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[.18em] text-altin">
              Özellikler
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-murekkep sm:text-4xl">
              Tahsilat için ihtiyacınız olan her şey
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {OZELLIKLER.map((o) => (
              <div key={o.baslik} className="rounded-2xl border border-cizgi bg-kart p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-murekkep/5 text-murekkep">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {o.cizim}
                  </svg>
                </span>
                <h3 className="mt-4 font-semibold text-murekkep">{o.baslik}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-murekkep-2">
                  {o.aciklama}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FİYATLANDIRMA */}
      <section id="fiyat" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[.18em] text-altin">
            Fiyatlandırma
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-murekkep sm:text-4xl text-balance">
            Basit, öngörülebilir fiyatlandırma
          </h2>
          <p className="mt-3 text-sm text-murekkep-2">
            14 gün ücretsiz deneme · Yıllık ödemede ~2 ay bedava · İstediğiniz an iptal
          </p>
        </div>
        <div className="mt-12 grid items-start gap-5 md:grid-cols-3">
          {PAKETLER.map((paket) => {
            const one = paket.one_cikan;
            return (
              <div
                key={paket.kod}
                className={`flex flex-col rounded-2xl p-7 ${
                  one
                    ? "border-2 border-altin bg-kart shadow-[0_18px_40px_-24px_rgba(168,118,15,.55)]"
                    : "border border-cizgi bg-kart"
                }`}
              >
                {one && (
                  <span className="mb-3 w-fit rounded-full bg-altin/12 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-altin">
                    En çok tercih edilen
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-murekkep">
                  {paket.ad}
                </h3>
                <p className="mt-1 text-sm text-murekkep-2">{paket.ozet}</p>
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl font-semibold tracking-tight text-murekkep">
                    ${paket.aylikUsd}
                  </span>
                  <span className="text-sm text-sis">/ ay</span>
                  <span className="ml-1 font-mono text-xs text-sis">
                    (yıllık ${paket.yillikUsd})
                  </span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-murekkep-2">
                  {paket.ozellikler.map((oz) => (
                    <li key={oz} className="flex gap-2.5">
                      <span className="mt-0.5 text-altin">✓</span>
                      {oz}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/kayit"
                  className={`mt-7 rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors ${
                    one
                      ? "bg-altin text-white hover:bg-[#946609]"
                      : "bg-murekkep text-kagit hover:bg-[#123a33]"
                  }`}
                >
                  Ücretsiz dene
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center font-mono text-xs text-sis">
          Fiyatlar USD'dir; tahsilat TL karşılığıyla yapılır. SMS/WhatsApp mesajları
          kullandıkça öde kontör modeliyle ücretlendirilir.
        </p>
      </section>

      {/* SSS — native details, JS'siz */}
      <section id="sss" className="border-t border-cizgi bg-kart/60">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-murekkep sm:text-4xl">
            Sık sorulan sorular
          </h2>
          <div className="mt-10 divide-y divide-cizgi border-y border-cizgi">
            {SSS.map((madde) => (
              <details key={madde.soru} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-murekkep">
                  {madde.soru}
                  <span className="font-mono text-altin transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-murekkep-2">
                  {madde.yanit}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* KAPANIŞ CTA — koyu çam */}
      <section className="bg-murekkep">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-kagit sm:text-[40px] text-balance">
            Vadesi geçen her gün, paranızın maliyetidir.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-kagit/70">
            Türkiye'de ortalama tahsil süresi 75 gün. Sizinki kaç gün? Panonuz beş
            dakikada hazır.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/kayit"
              className="rounded-xl bg-altin px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#946609]"
            >
              14 gün ücretsiz deneyin
            </Link>
            <Link
              href="/pilot"
              className="rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-kagit transition-colors hover:bg-white/10"
            >
              Pilot programına başvurun
            </Link>
          </div>
          <p className="mt-3 font-mono text-xs text-kagit/40">
            Pilot programında sınırlı sayıda KOBİ ile ücretsiz, birebir çalışıyoruz.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-kagit">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-sis">
          <span className="flex items-center gap-2 text-murekkep">
            <Isaret boyut={20} />
            <span className="font-display font-semibold">vadely</span>
          </span>
          <span className="font-mono text-xs">© 2026 Vadely</span>
          <nav className="flex gap-5">
            <Link href="/pilot" className="hover:text-murekkep">Pilot programı</Link>
            <Link href="/gizlilik" className="hover:text-murekkep">KVKK Aydınlatma</Link>
            <Link href="/kullanim-kosullari" className="hover:text-murekkep">Kullanım Koşulları</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// Hero imza öğesi: bir faturanın olgunlaşarak tahsil edilmiş nakde dönüşü.
function FaturaKarti() {
  return (
    <div className="rounded-3xl border border-cizgi bg-kart p-6 shadow-[0_30px_60px_-30px_rgba(12,43,38,.35)] sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[.16em] text-sis">
            Fatura
          </p>
          <p className="mt-1 font-mono text-sm font-medium text-murekkep">
            DEMO-2026-001
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-tahsil/10 px-3 py-1 text-xs font-semibold text-tahsil">
          <span className="lp-sikke inline-block h-1.5 w-1.5 rounded-full bg-tahsil" />
          Tahsil edildi
        </span>
      </div>

      <p className="mt-6 font-mono text-4xl font-semibold tracking-tight text-murekkep tabular-nums">
        ₺84.500<span className="text-2xl text-sis">,00</span>
      </p>
      <p className="mt-1 text-sm text-murekkep-2">Yıldız Metal San. A.Ş.</p>

      {/* Vade zaman çizgisi */}
      <div className="relative mt-10 mb-2 h-0.5 rounded bg-cizgi">
        <div
          className="lp-cizgi-dolgu absolute inset-y-0 left-0 w-full rounded"
          style={{
            background: "linear-gradient(90deg,#cbb98f 0%, var(--color-altin-parlak) 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-between">
          <Nokta etiket="Kesildi" alt="12 Nis" />
          <Nokta etiket="Vade" alt="12 May" durum="vade" />
          <Nokta etiket="Tahsil" alt="₺84.500" durum="tahsil" />
        </div>
      </div>
    </div>
  );
}

function Nokta({
  etiket,
  alt,
  durum,
}: {
  etiket: string;
  alt: string;
  durum?: "vade" | "tahsil";
}) {
  const nokta =
    durum === "tahsil"
      ? "lp-sikke bg-altin-parlak ring-4 ring-altin-parlak/20"
      : durum === "vade"
        ? "bg-kart ring-2 ring-inset ring-altin"
        : "bg-kart ring-2 ring-inset ring-sis/50";
  return (
    <div className="relative flex flex-col items-center">
      <span className={`h-3.5 w-3.5 rounded-full ${nokta}`} />
      <span
        className={`absolute top-6 whitespace-nowrap text-center text-xs font-medium ${
          durum === "tahsil" ? "text-altin" : "text-murekkep-2"
        }`}
      >
        {etiket}
        <span className="mt-0.5 block font-mono text-[10px] font-normal text-sis">
          {alt}
        </span>
      </span>
    </div>
  );
}
