import Link from "next/link";

export const metadata = {
  title: "Kullanım Koşulları — Vadely",
};

// NOT (kurucuya): Bu metin genel bir şablondur; yayına almadan önce
// hukukçuya inceletin. (plan.md Bölüm 10 ve 16)

export default function KullanimKosullariSayfasi() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-zinc-900">
            Vadely
          </Link>
          <Link href="/kayit" className="text-sm text-zinc-600 hover:text-zinc-900">
            Kayıt ol
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-6 text-zinc-700">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Kullanım Koşulları
        </h1>

        <h2 className="text-lg font-semibold text-zinc-900">1. Hizmet</h2>
        <p>
          Vadely; fatura verilerinizden ödeme hatırlatmaları planlayan ve
          gönderen, tahsilat ve nakit akışı görünürlüğü sunan bir yazılım
          hizmetidir (SaaS). Hizmet &quot;olduğu gibi&quot; sunulur; tahsilat
          sonuçları garanti edilmez.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          2. Abonelik ve ücretlendirme
        </h2>
        <p>
          Paketler aylık veya yıllık olarak ücretlendirilir; fiyatlar USD
          cinsinden ilan edilir, tahsilat TL karşılığıyla yapılabilir.
          Mesajlaşma (SMS/WhatsApp) kullandıkça öde kontör modeliyle ayrıca
          ücretlendirilir. Deneme süresi 14 gündür.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          3. Kullanıcı yükümlülükleri
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            Yüklediğiniz fatura ve iletişim verilerinin doğruluğundan ve bu
            verileri işleme hukuki yetkinizden siz sorumlusunuz.
          </li>
          <li>
            Hatırlatma iletileri sizin adınıza ve talimatınızla gönderilir;
            ilgili mevzuata (KVKK, İYS/ticari ileti kuralları) uyum abonenin
            sorumluluğundadır.
          </li>
          <li>Hizmet, hukuka aykırı tahsilat baskısı için kullanılamaz.</li>
        </ul>

        <h2 className="text-lg font-semibold text-zinc-900">
          4. Fesih ve veri
        </h2>
        <p>
          Aboneliğinizi dilediğiniz an sonlandırabilirsiniz. Hesap
          silindiğinde verileriniz geri döndürülemez biçimde silinir;
          silmeden önce &quot;Verilerimi indir&quot; ile dışa aktarım
          yapabilirsiniz.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          5. Sorumluluğun sınırı
        </h2>
        <p>
          Vadely; dolaylı zararlardan, veri kaynaklı hatalı hatırlatmalardan
          ve üçüncü taraf servis kesintilerinden sorumlu tutulamaz. Toplam
          sorumluluk, son 12 ayda ödenen abonelik bedeliyle sınırlıdır.
        </p>

        <p className="text-zinc-400">Son güncelleme: Temmuz 2026</p>
      </main>
    </div>
  );
}
