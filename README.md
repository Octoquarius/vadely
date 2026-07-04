# Vadely

**Türk KOBİ'leri için alacak tahsilatı SaaS'ı.** Vadely, vadesi geçen faturalarınızı
ilişkiyi bozmadan, otomatik ve nazik hatırlatmalarla tahsil etmenize yardım eder;
tahsilat süresini (DSO) kısaltır ve nakdinizi öne çeker.

🌐 Canlı: **https://vadely.vercel.app**

---

## İçindekiler

- [Vadely nedir?](#vadely-nedir)
- [Öne çıkan özellikler](#öne-çıkan-özellikler)
- [Kullanım kılavuzu](#kullanım-kılavuzu)
- [Paketler](#paketler)
- [Teknoloji yığını](#teknoloji-yığını)
- [Yerel geliştirme](#yerel-geliştirme)
- [Mimari notları](#mimari-notları)
- [Dağıtım (Vercel)](#dağıtım-vercel)
- [Operasyon / kurulum adımları](#operasyon--kurulum-adımları)

---

## Vadely nedir?

Küçük ve orta ölçekli işletmelerde nakit akışının en büyük düşmanı, **vadesi geçmiş
ama tahsil edilememiş faturalardır**. Muhasebe ekibi ya hatırlatma yapmaya vakit
bulamaz ya da "müşteriyi kırmaktan" çekinir. Vadely bu boşluğu doldurur:

- Faturalarınızı **e-Fatura/e-Arşiv XML** veya **CSV** ile saniyeler içinde içeri alır.
- Vade tarihine göre **otomatik, kademeli ve nazik** hatırlatma planı üretir
  (ön hatırlatma → vade günü → nazik gecikme → kararlı gecikme).
- Hatırlatmaları **e-posta** (ve Profesyonel pakette **WhatsApp**) ile gönderir.
- Ödemeleri **banka ekstresiyle eşleştirir**, fatura bakiyelerini otomatik kapatır.
- **DSO panosu** ile tahsilat performansınızı ve "öne çekilen nakdi" ölçer.

Vaadin özü: **ilişkiyi bozmadan tahsilat.** Şablonların tonu bilinçli olarak
tehditkâr değil, çözüm odaklıdır.

---

## Öne çıkan özellikler

| Alan | Ne yapar |
| --- | --- |
| **Müşteriler** | Cari kart yönetimi; e-posta/telefon/WhatsApp ve kanal izinleri (KVKK uyumu). |
| **Faturalar** | Manuel giriş, CSV içe aktarma (Türkçe Excel biçimleri: `;` ayraç, `1.234,56`, `gg.aa.yyyy`, Windows-1254), GİB e-Fatura/e-Arşiv **UBL-TR XML** içe aktarma. |
| **Ödemeler** | Manuel ödeme girişi, banka ekstresi içe aktarma, faturayla **eşleştirme** (kısmi ödeme desteği; bakiye ve durum otomatik güncellenir). |
| **Hatırlatma kadansı** | Vade gününe göre gün farkı bazlı kural motoru; her adım için şablon seçimi. |
| **Gönderim** | "Onaylı" (önce siz onaylayın) veya "otomatik" mod; değişmez **olay günlüğü**. |
| **Takip** | Resend webhook'u ile açılma/tıklanma/bounce durumları hatırlatmalara işlenir. |
| **DSO panosu** | Ortalama tahsilat süresi, yaşlandırma, öne çekilen nakit göstergesi. |
| **Onboarding** | Veri durumundan hesaplanan 4 adımlı kurulum kontrol listesi + tek tık örnek veri. |
| **KVKK** | Aydınlatma metni, kayıtta açık rıza (sunucuda zorunlu + zaman damgası), verilerimi indir (JSON), hesabı kalıcı silme. |
| **Yönetim paneli** | Platform yöneticisi için kiracılar-üstü gözetim (hesaplar, metrikler, pilot başvuruları). |

---

## Kullanım kılavuzu

### 1. Hesap oluşturma
`/kayit` → şirket adı, ad soyad, e-posta, şifre (en az 8 karakter) ve KVKK onayı.
Şifrenizi unutursanız `/sifremi-unuttum` üzerinden sıfırlama bağlantısı isteyin.

### 2. Müşterileri ekleyin
**Panel → Müşteriler.** Tek tek ekleyebilir ya da fatura içe aktarırken müşteriler
otomatik oluşturulur. Her müşteri için **e-posta izni** (`izin_eposta`) işaretli
olmalıdır — izinsiz müşteriye hatırlatma gönderilmez.

### 3. Faturaları içeri alın
**Panel → Faturalar → İçe Aktar.** İki sekme:
- **CSV:** Dosyayı yükleyin; kolonlar (müşteri, fatura no, tarih, vade, tutar…)
  başlıklardan otomatik tahmin edilir, onaylayıp aktarırsınız.
- **e-Fatura/e-Arşiv XML:** GİB UBL-TR faturalarını doğrudan yükleyin; fatura no,
  tarih, vade, tutar, müşteri unvanı ve VKN otomatik okunur.

### 4. Hatırlatma kadansını ayarlayın
**Panel → Hatırlatmalar → Kadans.** Örn. `-3 gün` (ön hatırlatma), `0 gün`
(vade günü), `+7 gün` (nazik gecikme), `+21 gün` (kararlı gecikme). Her adıma bir
şablon atarsınız. **"Plan üret"** dediğinizde açık faturalarınız için zamanı gelen
hatırlatmalar planlanır.

### 5. Hatırlatmaları gönderin
**Panel → Hatırlatmalar.** "Onaylı" modda bekleyenleri gözden geçirip
**Bekleyenleri gönder** ile toplu ya da tek tek gönderirsiniz. WhatsApp için
kopyala-gönder yöntemi kullanılır. Gönderilen her şey **Günlük**'te kayıt altındadır.

### 6. Ödemeleri işleyin ve eşleştirin
**Panel → Ödemeler.** Ödemeyi manuel girin veya **banka ekstresi** yükleyin
(mükerrer satırlar otomatik atlanır). Ödemeyi ilgili faturayla **eşleştirin** —
fatura bakiyesi ve durumu (açık/kısmi/kapalı) otomatik güncellenir.

### 7. Performansı izleyin
**Panel → Genel Bakış.** DSO (ortalama tahsilat süresi), açık alacak, yaşlandırma
ve hatırlatmalar sayesinde öne çekilen nakit.

### 8. Yönetim paneli (yalnızca platform yöneticisi)
Yöneticiyseniz panel sağ üstünde **Yönetim** rozeti görünür. `/yonetim` tüm
kiracılar genelinde hesap/alacak/tahsilat metriklerini ve hesap listesini,
`/yonetim/pilot` ise pilot başvurularını gösterir.

---

## Paketler

14 gün deneme (her şey açık). Fiyatlar USD; yıllıkta ~2 ay bedava.

| Paket | Aylık | Öne çıkanlar |
| --- | --- | --- |
| **Başlangıç** | $12 | Otomatik e-posta hatırlatmaları, kadans motoru, DSO panosu, CSV/e-Fatura içe aktarma |
| **Profesyonel** ⭐ | $24 | Başlangıç + WhatsApp, banka ekstresi eşleştirme, ödeme linki (yakında) |
| **İşletme** | $48 | Profesyonel + risk skoru (yakında), 30/60/90 gün nakit tahmini (yakında), öncelikli destek |

---

## Teknoloji yığını

- **Next.js 16** (App Router, Server Components, Server Actions) + **React 19**
- **Supabase** (Postgres + Auth + RLS); şema `ozel`/`public`, çok kiracılılık `hesap_id`
- **Tailwind CSS 4**
- **Resend** (transactional e-posta + webhook ile durum takibi)
- **Vercel** (dağıtım)

---

## Yerel geliştirme

```bash
npm install
cp .env.example .env.local   # değerleri doldurun
npm run dev                  # http://localhost:3000
```

Gerekli ortam değişkenleri (`.env.example`):

| Değişken | Açıklama |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) anahtarı |
| `RESEND_API_KEY` | E-posta gönderimi (yoksa gönderim düğmeleri anlaşılır hata verir) |
| `MAIL_FROM` | Gönderen adresi (örn. `Vadely <onboarding@resend.dev>`) |
| `RESEND_WEBHOOK_SECRET` | Resend webhook imza doğrulaması (açılma/tıklanma takibi) |

Faydalı komutlar: `npm run build`, `npm run lint`.

---

## Mimari notları

- **Çok kiracılılık:** Her tabloda `hesap_id` vardır; varsayılanı
  `ozel.aktif_hesap_id()`, erişim **RLS** ile kısıtlanır. Bir kiracı yalnızca kendi
  verisini görür.
- **Ödeme-fatura eşleştirme** her zaman `odeme_eslestir` / `eslesme_kaldir` RPC'leri
  ile yapılır (bakiye + durum güncellemesini bunlar yürütür).
- **Migration'lar** Supabase üzerinde yönetilir (MCP `apply_migration`); repoda
  ayrı migration klasörü tutulmaz.
- **Güvenlik:** Webhook svix imzası + ±5 dk replay penceresiyle doğrulanır; e-posta
  şablonlarında kullanıcı verisi HTML'e kaçırılarak gömülür; yönetim fonksiyonları
  SECURITY DEFINER olup içeride yetki denetler.

---

## Dağıtım (Vercel)

Üretime dağıtım **CLI** ile yapılır:

```bash
vercel deploy --prod
```

> ⚠️ Bayraksız `vercel deploy` yalnızca **preview** üretir ve canlı alias'ı
> güncellemez. Üretim için `--prod` şarttır.

---

## Operasyon / kurulum adımları

Kod dışında, Supabase panelinden yapılması gereken birkaç ayar:

### E-posta onayını açmak
Şu an kayıtta onay e-postası gönderilmiyor; hesap doğrudan açılıyor. Onay akışını
etkinleştirmek için: **Supabase → Authentication → Sign In / Providers → Email →
"Confirm email" ON.** (Uygulama kodu onay akışını zaten destekler: kayıt sonrası
"onay bağlantısına tıklayın" mesajı, `email_not_confirmed` hatası ve
`/auth/callback` kod değişimi hazırdır.)

> Not: Supabase CLI `config push` **kullanmayın** — bildirilmeyen `[auth]`
> alanlarına CLI varsayılanlarını dayatıp onayları kapatabilir.

### Platform yöneticisi eklemek
Yönetim paneline erişim `public.platform_yoneticileri` tablosundaki kullanıcılara
açıktır. Yeni bir yönetici eklemek için (Supabase SQL editöründe):

```sql
insert into public.platform_yoneticileri (user_id)
select id from auth.users where email = 'ornek@sirket.com'
on conflict (user_id) do nothing;
```

### Resend webhook'u
`https://vadely.vercel.app/api/webhooks/resend` adresine `opened`/`clicked`/`bounced`
olayları gönderilir; `RESEND_WEBHOOK_SECRET` ile imza doğrulanır.
