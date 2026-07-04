import Link from "next/link";

export const metadata = {
  title: "KVKK Aydınlatma Metni — Vadely",
};

// NOT (kurucuya): Bu metin genel bir şablondur; yayına almadan önce
// KVKK uzmanı bir hukukçuya inceletin. (plan.md Bölüm 10 ve 16)

export default function GizlilikSayfasi() {
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
          Kişisel Verilerin Korunması Aydınlatma Metni
        </h1>
        <p>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)
          uyarınca, Vadely hizmetinin (&quot;Hizmet&quot;) kullanımı
          kapsamında işlenen kişisel verilere ilişkin aydınlatma
          yükümlülüğünün yerine getirilmesi amacıyla hazırlanmıştır.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          1. Veri sorumlusu
        </h2>
        <p>
          Hizmet, Vadely (&quot;Şirket&quot;) tarafından sunulmaktadır.
          Hizmete kaydolan işletmenin (abone) kendi müşterilerine ait veriler
          bakımından veri sorumlusu abonenin kendisi, Vadely ise KVKK
          kapsamında <strong>veri işleyen</strong> sıfatıyla hareket eder.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          2. İşlenen veriler
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Abone kullanıcıları:</strong> ad soyad, e-posta, şifre
            (şifrelenmiş), şirket unvanı, kullanım kayıtları.
          </li>
          <li>
            <strong>Abonenin müşterileri (cariler):</strong> unvan, vergi
            kimlik numarası, iletişim bilgileri (e-posta, telefon), fatura ve
            ödeme kayıtları.
          </li>
        </ul>
        <p>
          Veri minimizasyonu ilkesi gereği fatura kalem detayları gibi
          tahsilat takibi için gerekli olmayan veriler işlenmez.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          3. İşleme amaçları ve hukuki sebep
        </h2>
        <p>
          Veriler; alacak takibi, ödeme hatırlatmalarının iletilmesi, nakit
          akışı raporlaması ve hizmetin sunulması amaçlarıyla, KVKK m.5/2(c)
          (sözleşmenin ifası) ve m.5/2(f) (meşru menfaat — ticari alacağın
          takibi) hukuki sebeplerine dayanılarak işlenir.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">4. Aktarım</h2>
        <p>
          Veriler, hizmetin sunulması için gerekli teknik altyapı
          sağlayıcılarına (barındırma, veritabanı, e-posta iletimi) sözleşme
          çerçevesinde aktarılabilir. Verileriniz reklam amaçlı üçüncü
          taraflarla paylaşılmaz.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          5. Saklama ve silme
        </h2>
        <p>
          Veriler abonelik süresince saklanır. Hesap silindiğinde tüm tenant
          verisi geri döndürülemez biçimde silinir; yasal saklama
          yükümlülükleri (ör. VUK) saklıdır.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          6. KVKK m.11 kapsamındaki haklarınız
        </h2>
        <p>
          Verilerinize erişme, düzeltme, silme, işlemeye itiraz etme ve
          taşınabilirlik haklarınızı panel içindeki &quot;Verilerimi
          indir&quot; ve &quot;Hesabı sil&quot; araçlarıyla ya da bize
          e-postayla başvurarak kullanabilirsiniz.
        </p>

        <p className="text-zinc-400">Son güncelleme: Temmuz 2026</p>
      </main>
    </div>
  );
}
