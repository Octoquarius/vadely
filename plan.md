# plan.md — AI Destekli Otomatik Alacak Tahsilatı + Nakit Akışı Tahminleme SaaS'ı (Türkiye)

> Çalışma adı: **"Tahsilat Asistanı"** (VARSAYIM — marka adı sonra belirlenecek).
> Tüm parasal tutarlar **USD** cinsindendir (dönüşüm çıpası: 1 USD ≈ 46,7 TL, Temmuz 2026).
> İşgücü/maaş maliyeti bu planda **yer almaz** — erken aşama solo kurucu / sweat equity varsayımı.

---

## 1. Yönetici Özeti

**Vizyon:** Türkiye'deki her KOBİ'nin alacaklarını insan müdahalesi olmadan, ilişkiyi bozmadan ve öngörülebilir şekilde tahsil etmesini sağlamak.

**Tek cümlelik değer önerisi:** "Faturalarınızı biz takip edelim; müşterinizle aranız bozulmadan paranız daha erken gelsin, önümüzdeki 90 günde kasada ne olacağını bugünden görün."

**Kime:** e-Fatura/e-Arşiv kullanan, vadeli (B2B) satış yapan, 5-250 çalışanlı Türk KOBİ'leri — özellikle imalat, toptan ticaret, hizmet ve ajans segmentleri.

**Neyi çözüyor:** KOBİ'ler faturayı kesmeyi biliyor; **tahsil etmeyi** sistematik yapamıyor. Hatırlatma yapmak utandırıcı, unutuluyor, tutarsız; nakit akışı görünmez. Ürün, GİB e-Fatura verisi + banka hareketlerinden beslenen bir **veri hattı** üzerine kurulu otomatik, kişiselleştirilmiş tahsilat iş akışı ve 30/60/90 gün nakit tahmini sunar.

**Neden şimdi:** 1 Ocak 2026 itibarıyla bilanço esasına tabi mükelleflerde kâğıt fatura tamamen yasak ve bu kural **yürürlükte** — her ticari işlem artık GİB üzerinden dijital akıyor. Yapılandırılmış fatura verisi neredeyse evrensel; ürünün ihtiyaç duyduğu ham madde her KOBİ'de hazır.

**Stratejik ilke:** Çekirdek değer AI modeli değil; **veri hattı + iş akışı**dır. AI katmanı soyutlanmış ve sağlayıcı-bağımsızdır (model-agnostic) — model piyasası ne kadar hızlı değişirse değişsin ürün eskimez.

---

## 2. Problem & Pazar

### Problem

- KOBİ başarısızlıklarının **~%82'sinde** kötü nakit akışı yönetimi rol oynuyor.
- Türkiye imalatta ortalama alacak tahsil süresi 2024'te **75 güne** ulaştı (TCMB).
- Atradius 2025: B2B faturaların **~2/3'ü gecikmeli** ödeniyor; kötü borçlar B2B satışın **~%10'una** ulaşıyor.
- KOBİ'de tahsilat takibi tipik olarak patronun veya ön muhasebecinin aklında/Excel'inde. Hatırlatma yapılınca "ilişki bozulur" korkusu var; yapılmayınca vade uzuyor. Sonuç: kârlı ama nakitsiz şirketler.

### İdeal Müşteri Profili (ICP)

| Özellik | Hedef |
|---|---|
| Segment | İmalat, toptan/dağıtım, B2B hizmet, ajans |
| Büyüklük | 5-250 çalışan; ayda 20-500 arası satış faturası |
| Satış modeli | Vadeli B2B satış (30-120 gün vade) |
| Mevcut araçlar | Paraşüt / Logo / Mikro gibi ön muhasebe + Excel |
| Ağrı düzeyi | Açık alacak bakiyesi aylık cironun 2-3 katı; DSO 60+ gün |
| Karar verici | Şirket sahibi veya mali işler sorumlusu |

### Pazar Boşluğu (Whitespace)

Türkiye'de **AI odaklı yerli otomatik alacak tahsilatı (autonomous AR) oyuncusu yok**. Yerli araçlar ön muhasebe/faturalama tarafında yoğunlaşmış durumda; en yakın yerli benzer Mikro'nun "Tahsildar" modülü. Figopara faktoring (alacağı satın alma) yapıyor — otomatik dunning/nakit tahmini değil. Küresel oyuncular (HighRadius, BlackLine, Esker, Bill.com, Versapay, Tipalti) Türkiye'de yerleşik değil ve GİB/yerel bankacılık entegrasyonları yok. Bu bulgu Bölüm 16'daki adımlarla birincil kaynaklardan teyit edilecek.

---

## 3. Rakip & Konumlandırma

### Rekabet Haritası

| Oyuncu | Ne yapıyor | Bizden farkı |
|---|---|---|
| Paraşüt, Logo İşbaşı, Mikro | Ön muhasebe, faturalama | Fatura **kesmeye** odaklı; tahsilat otomasyonu ve tahmin yok/zayıf. **Rakip değil, veri kaynağı ve potansiyel kanal.** |
| Mikro "Tahsildar" | Temel tahsilat hatırlatma | Mikro ekosistemine kilitli; AI risk skoru, nakit tahmini, çok kanallı kişiselleştirilmiş dunning yok. |
| Figopara | Fatura finansmanı / faktoring | Alacağı iskonto ile satın alıyor; tahsilat sürecini otomatikleştirmiyor. Uzun vadede **ortaklık adayı** (riskli alacağa finansman yönlendirme). |
| HighRadius, BlackLine, Esker, Versapay, Bill.com, Tipalti | Kurumsal AR otomasyonu (global) | Enterprise fiyatlı, TR yerelleştirmesi (GİB, KVKK, TL, WhatsApp kültürü) yok; KOBİ'ye inmiyor. |
| Banka/fintech nakit yönetimi panelleri | Hesap görünümü | Alacak tarafını (fatura + davranış) görmüyor; iş akışı yok. |

### Konumlandırma Tezi: "Tamamlayıcı, Rakip Değil"

- Ön muhasebe araçlarının **yerine geçmiyoruz**; onların ürettiği fatura verisinin **üzerine** tahsilat ve tahmin katmanı ekliyoruz.
- Mesaj: *"Paraşüt/Logo/Mikro faturanı keser, biz paranı toplarız."*
- Bu konum (a) rakip tepkisini geciktirir, (b) entegrasyon ortaklıklarının (Aşama 2) kapısını açar, (c) müşterinin mevcut alışkanlığını değiştirmesini gerektirmediği için satış sürtünmesini düşürür.
- Savunma hattı: ürün derinleştikçe biriken **ödeme davranışı verisi** (kim, kime, ne kadar gecikmeyle ödüyor) taklit edilmesi en zor varlıktır — ağ etkisi yaratır.

---

## 4. Ürün Kapsamı

### MVP (Aşama 0 çıktısı) — SADECE iki şey

1. **Otomatik tahsilat hatırlatmaları (dunning):** Fatura vadesine göre kurala dayalı, kişiselleştirilebilir şablonlu hatırlatma dizileri. İlk kanal **e-posta** (en düşük entegrasyon maliyeti), hemen ardından WhatsApp.
2. **Basit DSO panosu:** Açık alacak yaşlandırması (aging), DSO trendi, en riskli 10 fatura/müşteri listesi.

MVP'ye **bilerek dahil olmayanlar:** risk skoru (ML), nakit akışı tahmini, çoklu banka, muhasebe yazılımı API entegrasyonları. Veri girişi MVP'de GİB e-Arşiv çekimi + **CSV import fallback** ile çözülür.

### v1 (Aşama 1 — karar eşikleri tutarsa)

- **Risk skoru:** Önce kural tabanlı (gecikme geçmişi, tutar, sektör), sonra ML (bkz. Bölüm 9).
- **30/60/90 gün nakit akışı tahmini:** Açık faturalar + tahmini ödeme tarihleri + banka bakiyesi.
- **Çok kanallı dunning:** WhatsApp + SMS + e-posta orkestrasyonu; kanal/kadans optimizasyonu.
- **Tek-tık ödeme linki:** Hatırlatma mesajının içinde sanal POS linki.
- Açık bankacılık ile otomatik ödeme eşleştirme (tahsilatın kapandığını insan girmeden anlama).

### v2 (Aşama 2)

- Ön muhasebe yazılımlarıyla (Paraşüt, Logo, Mikro) çift yönlü API entegrasyonları ve marketplace listelenmeleri.
- Mali müşavir çoklu-müşteri paneli (bir müşavir 30 mükellefini tek ekrandan yönetir).
- Sektörel kıyas verileri ("sektörünüzde ortalama DSO 68 gün, sizinki 82").
- Riskli alacak için finansman yönlendirme ortaklığı (ör. Figopara) — komisyon geliri.
- Anlaşmazlık/itiraz yönetimi (fatura itirazlarını akışta yakalama).

---

## 5. Aşamalı Yol Haritası + Karar Eşikleri

### Aşama 0 — Doğrulama + MVP (0-3 ay)

- **15-20 KOBİ mülakatı** (hedef ICP'den): tahsilat sürecini, "ilişki bozulur" korkusunun gerçekliğini, ödeme istekliliğini doğrula. Mülakatlar bitmeden kod yazımı minimum tutulur.
- **MVP inşası:** GİB e-Arşiv/e-Fatura verisi çekimi (özel entegratör aracılığıyla veya portal dışa aktarımı + CSV fallback) + **1 banka** hesap hareketi bağlantısı + e-posta dunning + DSO panosu.
- **5-25 ödeyen müşteri** ile erken çekiş; 2-4 haftalık ücretsiz pilot → ücretli geçiş.

### Aşama 1 — Ürün-Pazar Uyumu (3-9 ay)

- Hedefler: **50+ ödeyen KOBİ**, müşterilerde **DSO'da >10 gün azalma** (ROI kanıtı), **aylık churn <%5**.
- Bu eşikler tutarsa: **nakit akışı tahmini + risk skoru** modülleri (v1) eklenir; WhatsApp/SMS kanalları ve ödeme linki devreye alınır.
- Fiyatlama kademelerinin (Başlangıç/Profesyonel/İşletme) gerçek kullanımla doğrulanması.

### Aşama 2 — Ölçek (9-18 ay)

- Ön muhasebe yazılımlarıyla **entegrasyon ortaklıkları** ve marketplace kanalları.
- Mali müşavir kanalının sistematikleştirilmesi (kanal komisyon modeli).
- Hedef: **500+ ödeyen KOBİ** (~$120K ARR baz senaryoda).

### ⛔ GERİ DÖNÜŞ KRİTERİ

> **İlk 9 ayda 50 ödeyen müşteri VE ölçülebilir DSO iyileşmesi yoksa strateji gözden geçirilir.** Seçenekler: (a) segment değiştir (ör. yalnızca mali müşavirlere satış), (b) tek özelliğe daralt (yalnızca dunning), (c) ürünü ön muhasebe oyuncularına white-label teklif et, (d) durdur. "Biraz daha zaman verelim" bu planda geçerli bir seçenek değildir.

---

## 6. Teknik Mimari

### İlkeler

- **Bakım yükü minimum:** Solo kurucu; yönetilen servisler > kendi sunucun. Sıkıcı, kanıtlanmış teknoloji.
- **Modüler monolit:** Mikroservis yok. Tek depoda net modül sınırları; ölçek gerektirirse sonra ayrıştırılır.
- **AI katmanı sağlayıcı-bağımsız:** Tüm LLM/ML çağrıları tek bir iç arayüzün (`AiProvider`) arkasında; model/sağlayıcı konfigürasyonla değişir.
- **Çekirdek değer veri hattında:** AI modülü tamamen kapatılsa bile ürün (kural tabanlı dunning + pano) çalışmaya devam eder.

### Sistem Şeması

```
┌────────────────────────────────────────────────────────────────────┐
│                        VERİ KAYNAKLARI                             │
│  GİB e-Fatura/e-Arşiv     Banka API'leri        CSV Import         │
│  (özel entegratör)        (açık bankacılık)     (fallback)         │
└───────────┬───────────────────┬──────────────────────┬─────────────┘
            ▼                   ▼                      ▼
┌────────────────────────────────────────────────────────────────────┐
│  INGEST KATMANI (zamanlanmış işler + webhook alıcıları)            │
│  → ham veri arşivi (değiştirilmeden saklanır)                      │
└───────────────────────────────┬────────────────────────────────────┘
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│  NORMALİZE: tekilleştirme, cari eşleştirme, para birimi,           │
│  fatura ↔ ödeme eşleştirme (reconciliation)                        │
└───────────────────────────────┬────────────────────────────────────┘
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│  ÇEKİRDEK VERİTABANI (PostgreSQL)                                  │
│  Müşteri · Fatura · Ödeme · Hatırlatma · RiskSkoru · NakitTahmini  │
└──────┬──────────────────┬─────────────────────┬────────────────────┘
       ▼                  ▼                     ▼
┌─────────────┐   ┌──────────────────┐   ┌──────────────────────────┐
│ SKOR MOTORU │   │ DUNNING MOTORU   │   │ PANO / RAPORLAMA         │
│ (v1: kural→ │   │ (kural + kadans; │   │ (DSO, aging, tahmin)     │
│  ML; MVP'de │   │  MVP çekirdeği)  │   │                          │
│  yok)       │   └────────┬─────────┘   └──────────────────────────┘
└─────────────┘            ▼
                  ┌──────────────────┐        ┌─────────────────────┐
                  │ MESAJ KATMANI    │───────▶│ ÖDEME LİNKİ (v1)    │
                  │ e-posta/WA/SMS   │        │ sanal POS sağlayıcı │
                  └────────┬─────────┘        └──────────┬──────────┘
                           ▼                             ▼
                  ┌────────────────────────────────────────────────┐
                  │ GERİ BESLEME: açıldı/tıklandı/ödendi olayları  │
                  │ → skor motoru + kadans optimizasyonu           │
                  └────────────────────────────────────────────────┘

Kesikli katman (her modülün önünde): AiProvider arayüzü
— LLM sağlayıcısı (Claude/GPT/yerel model) konfigürasyonla değişir.
```

### Veri Hattı Akışı (uçtan uca döngü)

**Fatura ingest → normalize → (v1: skor) → dunning → ödeme → geri besleme:** Yeni fatura sisteme düşer → cariyle eşleştirilir → vade ve (v1'de) risk skoruna göre hatırlatma kadansı planlanır → mesaj gönderilir → ödeme linki tıklanır veya banka hareketinde ödeme görülür → fatura kapanır → gerçekleşen ödeme davranışı skor motorunu ve kadans şablonlarını besler. Bu kapalı döngü ürünün savunma hattıdır.

### Önerilen Stack (her seçim tek cümle gerekçeli; hepsi VARSAYIM — eşdeğerle değiştirilebilir)

| Katman | Seçim | Gerekçe (1 cümle) |
|---|---|---|
| Uygulama çatısı | **Next.js (TypeScript, App Router)** | Tek dil/tek depo ile hem pano hem API; devasa ekosistem, solo kurucu için en düşük bağlam değiştirme maliyeti. |
| Barındırma | **Vercel veya eşdeğer yönetilen platform** | Sunucu yönetimi sıfır; deploy/rollback/önizleme hazır gelir. |
| Veritabanı | **PostgreSQL (yönetilen: Neon/Supabase)** | İlişkisel finansal veri için endüstri standardı; yönetilen hizmetle yedekleme/ölçek dert değil. |
| ORM/migration | **Drizzle veya Prisma** | Şema değişikliklerini versiyonlu ve güvenli yapar. |
| Zamanlanmış işler / kuyruk | **Platform cron + iş kuyruğu (ör. Vercel Queues/Upstash QStash)** | Dunning ve ingest doğası gereği zamanlanmış iştir; yönetilen kuyruk retry/at-least-once'ı bedavaya getirir. |
| E-posta | **Resend/Postmark benzeri işlemsel e-posta API'si** | Teslim edilebilirlik (deliverability) uzmanlık işidir, satın alınır. |
| WhatsApp/SMS | **WhatsApp Business API (BSP üzerinden) + yerli SMS ağ geçidi** | Türkiye'de B2B iletişimin fiili kanalı WhatsApp; BSP kullanımı Meta onay sürecini basitleştirir. |
| Ödeme linki | **iyzico veya PayTR (link tabanlı)** | TR kartları/taksit desteğiyle yerleşik sanal POS; link modeli entegrasyonu bir API çağrısına indirir. |
| AI erişimi | **Kendi `AiProvider` arayüzümüz + arkasında AI Gateway türü çoklu-sağlayıcı yönlendirici** | Model-agnostiklik planın açık şartı; sağlayıcı değişimi tek konfigürasyon satırı olmalı. |
| ML (v1 risk skoru) | **Python mikroservis değil; önce SQL/TS kural motoru, sonra basit gradient boosting (ayrı batch job)** | Skor günlük batch üretilebilir; gerçek zamanlı ML servisi bakım yükü erken aşamada gereksiz. |
| İzleme | **Sentry + platform logları** | Hata görünürlüğü ilk günden şart; kurulumu dakikalar sürer. |

### "Teknolojik yeniliklerde kaybolmama" garantisi

- AI katmanı **yalnızca** şu üç yerde kullanılır ve üçü de arayüz arkasındadır: (1) dunning mesajı kişiselleştirme, (2) risk skoru açıklaması/özeti, (3) cari eşleştirme yardımcısı. Model değişse ürün davranışı değişmez.
- Skor ve tahmin motorlarının **kural tabanlı fallback'i** her zaman canlı tutulur; AI sağlayıcı kesintisi üründe kesinti yaratmaz.
- Ham veri değiştirilmeden arşivlenir; ileride daha iyi model çıktığında tüm geçmiş yeniden skorlanabilir.

---

## 7. Entegrasyonlar

Her entegrasyonda ilke: **önce fallback ile canlıya çık, gerçek entegrasyonu talep kanıtlayınca yap.**

| Entegrasyon | Gerçek entegrasyon | Başlangıç fallback'i | Not |
|---|---|---|---|
| **GİB e-Fatura/e-Arşiv** | GİB'e doğrudan değil, **özel entegratör** (ör. Logo/eLogo, Foriba/Sovos, Uyumsoft, İzibiz vb.) API'si üzerinden fatura verisi çekimi (VARSAYIM — entegratör API erişim koşulları Bölüm 16'da doğrulanacak) | Kullanıcının entegratör portalından aldığı **XML/UBL veya CSV/Excel dışa aktarımını** yükleme; ayrıca elle fatura girişi | MVP fallback ile başlar; ilk 2-3 entegratörle resmi bağlantı Aşama 1'de. |
| **Açık bankacılık (hesap hareketleri)** | TCMB/BKM açık bankacılık altyapısı (HHS/YÖS) veya banka API'leri üzerinden hesap hareketi çekimi (VARSAYIM — lisans/iş ortaklığı gereksinimi doğrulanacak; gerekirse lisanslı bir TPP/agregator ile ortaklık) | Banka ekstre dosyası (CSV/MT940) yükleme | Ödeme eşleştirme MVP'de yarı-manuel ("bu ödeme şu faturayı kapattı mı?" onayı) kabul edilebilir. |
| **Ödeme sağlayıcı (tek-tık link)** | iyzico / PayTR link API'si (v1) | Hatırlatma mesajına IBAN + tutar + açıklama bloğu koymak | Link, dunning mesajının dönüşüm oranını ölçülebilir kılar. |
| **E-posta** | İşlemsel e-posta API'si (MVP'de gerçek entegrasyon — en ucuz ve en kolay kanal) | — (fallback gerekmez) | SPF/DKIM/DMARC ilk günden kurulur; teslim edilebilirlik ürünün canı. |
| **WhatsApp** | WhatsApp Business API, bir BSP üzerinden; **onaylı şablon mesajları** | Kullanıcıya "kopyala-yapıştır" hazır mesaj üretme (tek tıkla panoya kopyala + wa.me linki) | **WhatsApp-öncelikli strateji:** TR'de açılma oranı en yüksek kanal; bildirim maliyeti ~$0,0006/adet. |
| **SMS** | Yerli toplu SMS ağ geçidi (İYS uyumlu) | WhatsApp/e-posta varken SMS ertelenebilir | ~$0,011/adet; yalnızca WhatsApp'ı olmayan alıcılara yedek kanal. |
| **Ön muhasebe yazılımları (Paraşüt/Logo/Mikro)** | Resmi API + marketplace ortaklığı (Aşama 2) | GİB verisi zaten fatura akışını kapsıyor; ayrıca CSV | Ortaklık, satış kanalı olarak entegrasyondan daha değerli. |

**Mesajlaşma maliyet modeli — pass-through (kontör):** Mesaj maliyetleri müşteriye kontör/kredi olarak yansıtılır (ör. paketle gelen aylık kontör + aşımda kontör satın alma). WhatsApp ~$0,0006 ve SMS ~$0,011 birim maliyetleri abonelik marjını **aşındırmaz**; mesaj hacmi büyüdükçe maliyet müşteriyle birlikte ölçeklenir.

---

## 8. Veri Modeli

Ana entiteler ve ilişkiler (PostgreSQL; hepsi `tenant_id` ile çok-kiracılı):

```
Hesap (tenant: KOBİ)
 └─< Kullanıcı (rol: sahip / muhasebe / salt-okur)
 └─< Müşteri (cari: KOBİ'nin alacaklı olduğu firma)
     ├─ alanlar: unvan, VKN, iletişim kanalları (e-posta/tel/WA),
     │           tercih edilen kanal, iletişim izinleri (KVKK/İYS)
     └─< Fatura
         ├─ alanlar: GİB UUID, no, tarih, vade, tutar, para birimi,
         │           kalan bakiye, durum (açık/kısmi/kapalı/itilaflı), kaynak (GİB/CSV/manuel)
         ├─< Ödeme  (n-n olabilir: bir ödeme birden çok faturayı kapatabilir →
         │           FaturaÖdemeEşleşme ara tablosu; kaynak: banka/ödeme linki/manuel)
         └─< Hatırlatma
             ├─ alanlar: kanal, şablon, planlanan/gönderilen zaman,
             │           durum (planlandı/gönderildi/açıldı/tıklandı/yanıtlandı), maliyet
             └─ bağlı: DunningKadansı (kural seti: vade-3g, vade günü, +7g, +15g...)
Müşteri ─< RiskSkoru (v1)
 └─ alanlar: skor (0-100), sürüm, üretim zamanı, girdi özeti, açıklama
Hesap ─< NakitTahmini (v1)
 └─ alanlar: ufuk (30/60/90), tarih aralığı, beklenen giriş, güven bandı, sürüm
Hesap ─< BankaHesabı ─< BankaHareketi (eşleşme: FaturaÖdemeEşleşme'ye bağlanır)
Denetim/olay tablosu: tüm gönderim ve durum değişiklikleri (immutable log)
```

Tasarım notları:

- **Skor ve tahminler sürümlüdür** (hangi kural/model sürümü üretti) — geriye dönük değerlendirme ve model değişimi için şart.
- **Ham ingest arşivi** ayrı tutulur (S3/Blob); çekirdek DB yalnızca normalize veri taşır.
- İletişim izinleri (KVKK/İYS) Müşteri entitesinde birinci sınıf alandır; izin yoksa dunning motoru o kanalı hiç göremez.

---

## 9. AI/ML Bileşenleri

İlke: **her AI bileşeninin kural tabanlı bir "sıfırıncı sürümü" vardır** ve AI kapansa bile ürün çalışır. Tüm LLM çağrıları `AiProvider` arayüzü arkasındadır.

### 9.1 Risk Skorlama (v1) — kural → ML

- **Sürüm 0 (kural):** Ağırlıklı puan: geçmiş ortalama gecikme günü, gecikme trendi, açık bakiye/tarihsel ciro oranı, kısmi ödeme alışkanlığı, fatura büyüklüğü. Şeffaf, açıklanabilir, ilk gün çalışır.
- **Sürüm 1 (ML):** Yeterli etiketli veri birikince (gerçekleşen ödeme tarihleri = doğal etiket) gradient boosting (XGBoost/LightGBM benzeri) ile "X gün içinde ödenme olasılığı". Günlük batch job; gerçek zamanlı servis gerekmez.
- **LLM'in rolü:** Skoru **üretmek değil**, açıklamak ("Bu müşteri son 6 ayda ortalama 22 gün gecikti; risk yükseliyor çünkü...").

### 9.2 Nakit Akışı Tahmini (v1)

- **Sürüm 0:** Deterministik: açık faturalar × (vade + müşterinin tarihsel ortalama gecikmesi) → 30/60/90 gün beklenen giriş; iyimser/kötümser bant.
- **Sürüm 1:** Müşteri bazlı ödeme tarihi dağılımı (survival analizi veya kantil regresyon) ile olasılıklı tahmin.
- Tahmin her zaman **banka bakiyesiyle** birlikte sunulur (tahmin + mevcut nakit = eyleme dönük tablo).

### 9.3 Dunning Kişiselleştirme (MVP'de şablon, v1'de LLM)

- **MVP:** Elle yazılmış, değişkenli şablon setleri (nazik → kararlı tonda kademelenen 3-4 basamaklı kadans). Türkçe ticari nezaket kalıpları ürünün "ilişkiyi bozmama" vaadinin taşıyıcısıdır — bu şablonlar özenle, kurucu tarafından yazılır.
- **v1:** LLM, şablonu müşteri bağlamına göre uyarlar (ilişki süresi, tutar, geçmiş ton, sektör). Her mesaj **gönderim öncesi kural denetiminden** geçer (yasal ifade yok, tehdit yok, tutar/tarih doğruluğu şablondan). İsteğe bağlı "göndermeden önce onayla" modu.
- **Geri besleme:** Açılma/tıklanma/ödenme olayları hangi ton+kanal+kadansın işe yaradığını ölçer; önce basit A/B, sonra otomatik optimizasyon.

### 9.4 Soğuk Başlangıç Stratejisi

1. **Gün 0:** Kural tabanlı skor + deterministik tahmin — hiç veri gerektirmez, ilk müşteride çalışır.
2. **Onboarding'de geçmiş yükleme:** GİB/CSV'den son 12-24 ayın faturaları ve ödemeleri çekilir → müşteri **daha ilk hafta** kendi tarihsel davranış verisiyle anlamlı skor görür.
3. **Sektör önselleri:** Yeterli tenant birikince anonimleştirilmiş sektör ortalamaları (imalatta tipik gecikme X gün) yeni tenant'ların önseli olur (VARSAYIM — KVKK uyumlu anonimleştirme Bölüm 10 kapsamında tasarlanır).
4. **ML'e geçiş eşiği:** ~50+ tenant ve on binlerce kapanmış fatura birikince; öncesinde ML yatırımı yapılmaz.

---

## 10. Güvenlik & KVKK

İlk günden **privacy & security by design** — finansal veri işleyen üründe güven, özelliğin kendisidir.

- **Veri minimizasyonu:** Yalnızca tahsilat için gerekli alanlar (fatura başlığı, tutar, vade, cari iletişim). Fatura kalem detayı gerekmedikçe çekilmez/saklanmaz.
- **Şifreleme:** Aktarımda TLS 1.2+; durağan veride disk şifreleme + hassas alanlar (API anahtarları, banka tokenları) için uygulama katmanı şifreleme (envelope encryption).
- **Erişim kontrolü:** Çok kiracılı izolasyon her sorguda `tenant_id` zorunluluğu (Postgres RLS ile DB katmanında da zorlanır); rol bazlı yetki (sahip/muhasebe/salt-okur); tüm erişim denetim loguna yazılır.
- **KVKK uyumu:** VERBİS kaydı; aydınlatma metni; veri işleyen sıfatıyla müşterilerle veri işleme sözleşmesi (DPA); cari iletişim verisi için hukuki dayanak (meşru menfaat — ticari alacak takibi) yazılı olarak belgelenir (VARSAYIM — lansmandan önce KVKK uzmanı görüşü alınır, tek seferlik danışmanlık maliyeti İSTEĞE BAĞLI kaleme yazılır).
- **İYS (İleti Yönetim Sistemi):** Ticari elektronik ileti tarafında İYS uyumu; B2B tahsilat hatırlatmasının hukuki niteliği (pazarlama iletisi değil, sözleşmesel bildirim) yazılı görüşle netleştirilir (VARSAYIM).
- **Saklama politikası:** Sözleşme bitiminde veri X gün içinde silinir/anonimleştirilir (varsayılan 90 gün — VARSAYIM); yasal saklama süreleri (VUK) ayrık tutulur; müşteri "verimi indir + sil" hakkına panelden sahiptir.
- **Operasyonel güvenlik:** Sırlar ortam değişkeni kasasında (asla repo'da değil); bağımlılık taraması (Dependabot); yedekleme + geri dönüş testi; olay müdahale için basit runbook.
- **AI özelinde:** LLM sağlayıcıya kişisel veri **gönderilmeden önce** maskeleme (unvan/tutar kalır, kişi adı/telefon maskelenebilir); zero-data-retention seçenekli sağlayıcı/geçit tercihi.

---

## 11. İş Modeli & Fiyatlama

### Paketler (aylık / yıllık — yıllıkta ~2 ay bedava)

| Paket | Aylık | Yıllık | İçerik |
|---|---|---|---|
| **Başlangıç** | $12 | $120 | Otomatik hatırlatma (e-posta) + DSO panosu |
| **Profesyonel** | $24 | $240 | + Çok kanallı dunning (WhatsApp/SMS) + ödeme linki |
| **İşletme** | $48 | $480 | + Risk skoru + 30/60/90 nakit akışı tahmini |

- Mesajlaşma **pass-through kontör** modeliyle ayrıca ücretlendirilir (paketle gelen kontör + aşım satışı) — marjı korur.
- Harmanlanmış **ARPU baz senaryo ~$20/ay**.
- Yıllık paket nakit akışını öne çeker ve churn'ü yapısal olarak düşürür; satışta varsayılan teklif yıllıktır.

### Gelir Kademeleri (ARPU ~$20/ay baz)

| Ödeyen müşteri | ARR |
|---|---|
| 5 | $1.200 |
| 10 | $2.400 |
| 25 | $6.000 |
| 50 | $12.000 |
| 100 | $24.000 |
| 250 | $60.000 |
| 500 | $120.000 |
| 1.000 | $240.000 |

**ARPU duyarlılığı (500 müşteride):** düşük $13 → $78K; baz $20 → $120K; yüksek $33 → $198K ARR. (Yüksek senaryo, İşletme paketinin payının artması + kontör gelirleriyle ulaşılabilir.)

### ROI Hikayesi (satış anlatısının çekirdeği)

- Aylık $50K cirolu, DSO'su 75 gün olan bir KOBİ'de **DSO'nun 10 gün düşmesi ≈ ~$16-17K nakdin kalıcı olarak öne çekilmesi** demektir (10/30 × aylık ciro). Yıllık $240-480'lık abonelik, serbest kalan nakdin kredi maliyetinden (TR'de ticari kredi faizi dikkate alındığında) yüzlerce kat küçüktür.
- Mesaj: *"Yılda araba parası faiz maliyetinden kurtulmak için ayda bir yemek parası."*
- Bu hesap panoda müşteriye **kendi verisiyle** gösterilir ("bu ay sizin için öne çektiğimiz nakit: $X") — elde tutmanın (retention) ana mekanizması.

---

## 12. Maliyet & Birim Ekonomi

> **İşgücü/maaş hariçtir** — erken aşama solo kurucu / sweat equity. Aşağıdaki tüm rakamlar salt altyapı+servis maliyetidir.

### Maliyet Grupları

| Grup | Kalemler | Davranış |
|---|---|---|
| **SABİT** | Bulut/barındırma, yönetilen veritabanı, izleme (Sentry), alan adı, geliştirme araçları, e-posta altyapı taban ücreti | Müşteri sayısından bağımsız, öngörülebilir |
| **DEĞİŞKEN** | AI/LLM API çağrıları, WhatsApp/SMS mesaj maliyeti, entegratör API kullanım ücretleri | Kullanımla artar; mesajlaşma kısmı **müşteriye pass-through** |
| **İSTEĞE BAĞLI** | Pazarlama (reklam, içerik, etkinlik), tek seferlik hukuk/KVKK danışmanlığı | Bilinçli karar; kapatılabilir |

### Faz Bazlı Maliyet

| Faz | Aylık | Yıllık | Not |
|---|---|---|---|
| **Erken (~50-100 müşteri)** | ~$200-600 | ~$2.400-7.200 | Pazarlama hariç |
| **Ölçek (~500 müşteri)** | ~$2.200-6.000 | ~$26.000-72.000 | Pazarlama dahil; salt operasyon ~$1.100-2.800/ay |

### Birim Ekonomi

- Mesajlaşma birim maliyetleri: **WhatsApp bildirim ~$0,0006/adet, SMS ~$0,011/adet** — kontör modeliyle müşteriye yansıtıldığı için marjı aşındırmaz.
- **Brüt marj: ~%75-85** (klasik SaaS bandı; en büyük değişken kalem LLM çağrıları, o da mesaj başına şablon+uyarlama ile sınırlı tutulur).
- **Nakit başabaş:** Erken fazda **~15-30 ödeyen müşteri** (ARPU $20 × 15-30 ≈ $300-600 ≈ erken faz aylık maliyet). Ölçek fazında pazarlama dahil **~110-300 müşteri**.
- Kur riski notu: maliyetler ağırlıkla USD, gelir TL tahsil edilebilir — fiyat listesi USD'ye endekslenir (bkz. Bölüm 15).

---

## 13. GTM / Dağıtım

**Ana ilke: PLG (ürün odaklı büyüme) + iki kaldıraç: e-fatura kancası ve mali müşavir kanalı.**

1. **E-fatura kancası (zamanlama silahı):** Kâğıt fatura yasağı yürürlükte; her KOBİ zorunlu olarak dijital fatura kesiyor. Mesaj: *"Zorunlu e-faturaya geçtiniz; o veri artık sizin için para toplayabilir."* Uyum söylemini tahsilat değerine bağlayan içerik (SEO: "e-fatura tahsilat", "DSO nasıl düşürülür", "alacak takibi programı") ilk günden üretilir.
2. **İlk 15-20 mülakat = ilk satış hattı:** Mülakat yapılan KOBİ'lerin en ağrılıları ücretsiz pilota, pilot başarılıları ilk ödeyenlere dönüştürülür (mülakat → pilot → referans zinciri).
3. **Ücretsiz pilot → ilk ödeyenler:** 2-4 hafta, gerçek veriyle, tek başarı ölçütü baştan yazılı: "pilotta en az X fatura tahsilatı hızlandı / DSO şu kadar düştü." Pilot bitiminde panoda kendi ROI'sini gören müşteriye yıllık paket teklif edilir.
4. **Mali müşavir kanalı:** Bir müşavir 20-50 mükellef demektir. Müşavire çoklu-müşteri görünürlüğü (v2) + tavsiye komisyonu (ör. ilk yıl %20 — VARSAYIM). Türkiye'de KOBİ yazılım kararında müşavir tavsiyesi en güçlü tetikleyicidir.
5. **Self-servis PLG hattı:** CSV yükle → 5 dakikada aging + DSO panonu ücretsiz gör ("ücretsiz DSO analizi" olarak da pazarlanabilir) → hatırlatma göndermek için ücretli pakete geç. Değeri kartsız göster, iş akışını paraya bağla.
6. **Aşama 2 kanalları:** Ön muhasebe marketplace'leri (Paraşüt/Logo ekosistemi), sektör dernekleri/OSB'ler, fatura finansmanı ortaklıkları.

---

## 14. Metrikler / KPI

| Metrik | Tanım | Hedef |
|---|---|---|
| **DSO azalması** | Müşteri bazında, başlangıca göre ortalama tahsil süresi düşüşü | >10 gün (Aşama 1 eşiği) — ürünün varlık nedeni |
| **Tahsilat oranı** | Hatırlatma sonrası X gün içinde kapanan fatura oranı | Kadans bazında sürekli iyileşme |
| **Aktivasyon** | Kayıt → ilk 7 günde veri bağlanmış + ilk hatırlatma gönderilmiş | >%60 (VARSAYIM) |
| **Aylık churn** | İptal eden ödeyen müşteri oranı | <%5 (Aşama 1 eşiği) |
| **MRR / ARR** | Aylık/yıllık yinelenen gelir + kontör geliri ayrı izlenir | Bölüm 11 kademeleri |
| **CAC** | Kanal bazında müşteri edinme maliyeti | CAC geri ödeme <6 ay (VARSAYIM) |
| **NRR** | Net gelir tutundurma (paket yükseltme + kontör dahil) | >%100 hedefi (İşletme paketine yükselme ile) |
| **Mesaj performansı** | Kanal bazında açılma/tıklanma/ödemeye dönüşme | WhatsApp-öncelikli stratejinin sürekli testi |

Kuzey Yıldızı Metriği: **"Müşteriler için öne çekilen toplam nakit ($)"** — hem ürün başarısını hem satış anlatısını tek sayıda birleştirir.

---

## 15. Riskler & Azaltımlar

| Risk | Etki | Azaltım |
|---|---|---|
| **GİB/entegratör entegrasyon eforu** beklenenden ağır | MVP gecikir | CSV/XML import fallback ile canlıya çık; entegratör API'sini paralel yürüt; tek entegratörle başla. |
| **Açık bankacılık erişimi** lisans/ortaklık gerektirir | Ödeme eşleştirme manuel kalır | Ekstre dosyası yükleme + yarı-manuel eşleştirme MVP'de yeterli; lisanslı TPP ortaklığı Aşama 1-2'de. |
| **KVKK/İYS uyumsuzluğu** | Ceza + itibar | Bölüm 10 tasarımı ilk günden; lansman öncesi tek seferlik hukuki görüş; hatırlatmaların "sözleşmesel bildirim" niteliğinin yazılı tespiti. |
| **Rakip tepkisi** (Paraşüt/Logo/Mikro benzer modül ekler) | Kanal + pazar daralır | "Tamamlayıcı" konumu koru; ödeme davranışı veri birikimini ve çok-kaynaklı (tüm yazılımlarla çalışan) yapıyı hendek yap; ortaklıkları erken bağla. |
| **Kur riski** (maliyet USD, gelir TL) | Marj erimesi | Fiyat listesi USD'ye endeksli (TL tahsil edilse bile kur güncellenir); yıllık ön ödeme kur tamponu yaratır. |
| **Metodoloji riski** (dunning DSO'yu ölçülebilir düşürmezse) | Değer önerisi çöker | Pilotlarda önce/sonra ölçüm disiplini; kadans A/B testleri; Aşama 1 eşiği tutmazsa GERİ DÖNÜŞ kriteri işletilir. |
| **"İlişki bozulur" algısı** ürün kullanımını frenler | Aktivasyon düşük | Nazik şablonlar + "göndermeden onayla" modu + mesajların KOBİ'nin kendi adından gitmesi. |
| **Tek kurucu yoğunluğu** | Her şey darboğaz | Yönetilen servisler, modüler monolit, fallback-önce entegrasyon sırası — planın tamamı bu kısıta göre kurgulandı. |
| **LLM sağlayıcı değişimi/fiyat artışı** | Değişken maliyet oynar | `AiProvider` soyutlaması + kural tabanlı fallback; AI kapansa da ürün çalışır. |

---

## 16. Doğrulama Adımları (kurucu için yapılacaklar — iddia değil, kontrol listesi)

- [ ] **"Rakip yok" tezini teyit et:** Startups.watch ve Crunchbase'de "accounts receivable", "tahsilat", "dunning", "cash flow forecasting" + Türkiye filtresiyle tarama yap; son 24 ayın tohum yatırımlarını kontrol et.
- [ ] **GİB özel entegratör listesini tara:** GİB'in güncel özel entegratör listesinden 3-5 adayın (eLogo, Sovos/Foriba, Uyumsoft, İzibiz vb.) API dokümantasyonu, veri erişim koşulları ve fiyatlarını iste; "mükellef adına gelen/giden fatura çekme" yetkisinin sözleşmesel çerçevesini öğren.
- [ ] **GİB tebliğlerini birincil kaynaktan doğrula:** Kâğıt fatura yasağının kapsamını (hangi mükellef grupları, istisnalar) gib.gov.tr üzerindeki VUK Genel Tebliğlerinden teyit et; pazarlama metinlerinde tebliğ numarasıyla atıf yap.
- [ ] **TCMB 75 gün verisini kaynağıyla arşivle** (sektör raporu/istatistik linki) — satış sunumunda birincil kaynak göster.
- [ ] **Açık bankacılık erişim modelini netleştir:** BKM/TCMB çerçevesinde hesap bilgisi hizmeti için lisans mı, lisanslı iş ortağı mı gerektiğini öğren (bir fintech hukukçusuyla 1 saatlik görüşme yeterli).
- [ ] **İYS/KVKK ön görüş al:** B2B tahsilat hatırlatmasının ticari elektronik ileti sayılıp sayılmadığına dair yazılı görüş.
- [ ] **Mikro "Tahsildar" ve Figopara'yı ürün olarak dene/incele:** Gerçek özellik setlerini birinci elden görüp konumlandırma tablosunu güncelle.
- [ ] **15-20 KOBİ mülakatını tamamla** ve şu üç hipotezi test et: (1) "ilişki bozulur" korkusu gerçek mi, (2) $12-48/ay ödeme istekliliği var mı, (3) veri bağlama (GİB/CSV) zahmetine katlanırlar mı.

---

## 17. Uygulama Sırası (Claude Code için — MVP görev listesi)

Her görev tek oturumda tamamlanabilir büyüklükte; sıra bağımlılığa göre.

### Temel

- [ ] **T1 — Proje iskeleti:** Next.js (TypeScript) + PostgreSQL bağlantısı + ORM/migration altyapısı + Sentry; `AiProvider` arayüzünün boş iskeleti dahil.
- [ ] **T2 — Kimlik & çok kiracılılık:** Kayıt/giriş, Hesap (tenant) + Kullanıcı modeli, rol bazlı yetki, tüm sorgularda tenant izolasyonu (RLS dahil).
- [ ] **T3 — Çekirdek veri modeli:** Müşteri, Fatura, Ödeme, FaturaÖdemeEşleşme, Hatırlatma tablolarının migration'ları + temel CRUD API.

### Veri Girişi

- [ ] **T4 — CSV/Excel fatura import:** Şablon dosya + yükleme akışı + kolon eşleme ekranı + doğrulama/hata raporu; cari otomatik oluşturma.
- [ ] **T5 — e-Arşiv/e-Fatura XML (UBL) import:** Entegratör portalından indirilen XML dosyalarını ayrıştırıp Fatura+Müşteri'ye normalize etme.
- [ ] **T6 — Ödeme girişi:** Manuel ödeme kaydı + banka ekstresi (CSV) yükleme + faturayla yarı-manuel eşleştirme ekranı ("bu ödeme şu faturayı kapatıyor mu?").

### Dunning Motoru (MVP çekirdeği)

- [ ] **T7 — Kadans kural motoru:** Vadeye göre hatırlatma planlama (vade-3g / vade günü / +7g / +15g), tenant bazında özelleştirilebilir kurallar, zamanlanmış iş (cron) ile günlük plan üretimi.
- [ ] **T8 — E-posta gönderimi:** İşlemsel e-posta API entegrasyonu, Türkçe nazik→kararlı şablon seti (değişkenli), gönderim + açılma/tıklama webhook'larının Hatırlatma durumuna işlenmesi.
- [ ] **T9 — "Göndermeden onayla" modu + gönderim günlüğü:** Bekleyen hatırlatmalar kuyruğu, tek tık onay/düzenle/atla; immutable olay logu.
- [ ] **T10 — WhatsApp kopyala-gönder fallback'i:** Onaylı BSP entegrasyonu öncesi, hazır mesajı wa.me linki + panoya kopyala ile kullanıcıya sunma.

### Pano

- [ ] **T11 — DSO panosu:** DSO hesabı + trendi, alacak yaşlandırma (aging) tablosu, en riskli 10 fatura/müşteri listesi.
- [ ] **T12 — "Öne çekilen nakit" göstergesi:** Hatırlatma sonrası erken kapanan faturalardan ROI göstergesi (Kuzey Yıldızı metriği panoda).

### Ticarileştirme

- [ ] **T13 — Paket & abonelik:** 3 paket (aylık/yıllık), ödeme sağlayıcı aboneliği (iyzico/PayTR — VARSAYIM), paket bazlı özellik kapıları (feature flags).
- [ ] **T14 — Onboarding akışı:** Kayıt → CSV/XML yükle → 5 dakikada ilk DSO panosu → ilk kadansı kur sihirbazı; aktivasyon olay takibi (analytics).
- [ ] **T15 — KVKK temelleri:** Aydınlatma metni sayfaları, iletişim izni alanları, veri indir/sil uçları, saklama politikası job'ı.
- [ ] **T16 — Lansman hazırlığı:** Basit pazarlama sayfası (e-fatura kancası mesajıyla), demo tenant + örnek veri, pilot başvuru formu.

> v1 görevleri (risk skoru, nakit tahmini, WhatsApp BSP, ödeme linki, açık bankacılık) **Aşama 1 karar eşikleri tutunca** ayrı bir görev listesi olarak planlanır — MVP listesine bilinçli olarak eklenmedi.
