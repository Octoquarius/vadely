// Tahsilat hatırlatması e-posta şablonları.
// Ton kademesi: nazik ön hatırlatma -> bilgilendirici vade günü ->
// nazik gecikme -> kararlı (ama asla tehditkâr olmayan) gecikme.
// Bu metinler ürünün "ilişkiyi bozmadan tahsilat" vaadinin kendisidir.

export type SablonGirdisi = {
  gonderenUnvan: string; // hatırlatmayı gönderen şirket (tenant)
  musteriUnvan: string;
  faturaNo: string;
  faturaTarihi: string; // ISO
  vadeTarihi: string; // ISO
  kalanBakiye: number;
  paraBirimi: string;
  gecikmeGunu: number; // negatif: vadeye kalan gün
};

export type EpostaIcerik = {
  konu: string;
  html: string;
  metin: string;
};

function paraFormat(tutar: number, paraBirimi: string): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: paraBirimi,
    }).format(tutar);
  } catch {
    return `${tutar.toFixed(2)} ${paraBirimi}`;
  }
}

function tarihFormat(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Müşteri unvanı / fatura no gibi kullanıcı verileri HTML gövdeye gömülmeden
// önce kaçırılır (bozuk render / enjeksiyon önlenir). Düz metin sürümü
// paragraflardan etiket sökerek üretildiği için orada varlıklar geri çözülür.
function htmlKac(deger: string): string {
  return deger
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlCoz(metin: string): string {
  return metin
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function htmlSar(girdi: SablonGirdisi, paragraflar: string[]): string {
  const satirlar = paragraflar
    .map(
      (p) =>
        `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#27272a;">${p}</p>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="tr">
<body style="margin:0;padding:24px;background-color:#fafafa;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:32px;">
    ${satirlar}
    <table style="width:100%;margin:8px 0 20px 0;border-collapse:collapse;font-size:14px;color:#27272a;">
      <tr>
        <td style="padding:6px 0;color:#71717a;">Fatura no</td>
        <td style="padding:6px 0;text-align:right;font-weight:bold;">${htmlKac(girdi.faturaNo)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#71717a;">Fatura tarihi</td>
        <td style="padding:6px 0;text-align:right;">${tarihFormat(girdi.faturaTarihi)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#71717a;">Vade tarihi</td>
        <td style="padding:6px 0;text-align:right;">${tarihFormat(girdi.vadeTarihi)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#71717a;border-top:1px solid #e4e4e7;">Kalan tutar</td>
        <td style="padding:6px 0;text-align:right;font-weight:bold;border-top:1px solid #e4e4e7;">${paraFormat(girdi.kalanBakiye, girdi.paraBirimi)}</td>
      </tr>
    </table>
    <p style="margin:0 0 4px 0;font-size:15px;color:#27272a;">Saygılarımızla,</p>
    <p style="margin:0;font-size:15px;font-weight:bold;color:#27272a;">${htmlKac(girdi.gonderenUnvan)}</p>
    <p style="margin:24px 0 0 0;font-size:12px;color:#a1a1aa;">Ödemenizi yaptıysanız lütfen bu e-postayı dikkate almayın.</p>
  </div>
</body>
</html>`;
}

function metinYap(girdi: SablonGirdisi, paragraflar: string[]): string {
  return [
    ...paragraflar.map((p) => htmlCoz(p.replace(/<[^>]+>/g, ""))),
    "",
    `Fatura no: ${girdi.faturaNo}`,
    `Fatura tarihi: ${tarihFormat(girdi.faturaTarihi)}`,
    `Vade tarihi: ${tarihFormat(girdi.vadeTarihi)}`,
    `Kalan tutar: ${paraFormat(girdi.kalanBakiye, girdi.paraBirimi)}`,
    "",
    "Saygılarımızla,",
    girdi.gonderenUnvan,
    "",
    "Ödemenizi yaptıysanız lütfen bu e-postayı dikkate almayın.",
  ].join("\n");
}

type SablonUretici = (girdi: SablonGirdisi) => EpostaIcerik;

const SABLONLAR: Record<string, SablonUretici> = {
  on_hatirlatma: (girdi) => {
    const kalanGun = -girdi.gecikmeGunu;
    const paragraflar = [
      `Sayın <strong>${htmlKac(girdi.musteriUnvan)}</strong> yetkilisi,`,
      `${htmlKac(girdi.faturaNo)} numaralı faturamızın vadesi ${
        kalanGun > 0 ? `<strong>${kalanGun} gün sonra</strong>` : "yakında"
      } (${tarihFormat(girdi.vadeTarihi)}) doluyor. Planlamanıza yardımcı olması için kısa bir hatırlatma iletmek istedik.`,
      `Ödemenizi şimdiden planladıysanız harika — bu e-postayı gönül rahatlığıyla yok sayabilirsiniz.`,
    ];
    return {
      konu: `Hatırlatma: ${girdi.faturaNo} numaralı faturanın vadesi yaklaşıyor`,
      html: htmlSar(girdi, paragraflar),
      metin: metinYap(girdi, paragraflar),
    };
  },

  vade_gunu: (girdi) => {
    const paragraflar = [
      `Sayın <strong>${htmlKac(girdi.musteriUnvan)}</strong> yetkilisi,`,
      `${htmlKac(girdi.faturaNo)} numaralı faturamızın vadesi <strong>bugün</strong> (${tarihFormat(girdi.vadeTarihi)}) doluyor. Aşağıda fatura özetini bulabilirsiniz.`,
      `Ödemeniz bugün içinde yapılacaksa ayrıca bir işlem yapmanıza gerek yok. Herhangi bir sorunuz varsa bu e-postayı yanıtlamanız yeterli.`,
    ];
    return {
      konu: `${girdi.faturaNo} numaralı faturanın vadesi bugün doluyor`,
      html: htmlSar(girdi, paragraflar),
      metin: metinYap(girdi, paragraflar),
    };
  },

  nazik_gecikme: (girdi) => {
    const paragraflar = [
      `Sayın <strong>${htmlKac(girdi.musteriUnvan)}</strong> yetkilisi,`,
      `${htmlKac(girdi.faturaNo)} numaralı faturamızın vadesi ${tarihFormat(girdi.vadeTarihi)} tarihinde doldu; kayıtlarımıza göre ödeme henüz bize ulaşmadı. Gözden kaçmış olabileceğini düşünerek nazikçe hatırlatmak istedik.`,
      `Ödemeyi son günlerde yaptıysanız teşekkür ederiz — kayıtlarımıza yansıması birkaç gün sürebilir. Bir aksilik ya da sorunuz varsa bu e-postayı yanıtlamanız yeterli; birlikte çözüm bulalım.`,
    ];
    return {
      konu: `Hatırlatma: ${girdi.faturaNo} numaralı faturanın ödemesi görünmüyor`,
      html: htmlSar(girdi, paragraflar),
      metin: metinYap(girdi, paragraflar),
    };
  },

  kararli_gecikme: (girdi) => {
    const paragraflar = [
      `Sayın <strong>${htmlKac(girdi.musteriUnvan)}</strong> yetkilisi,`,
      `${htmlKac(girdi.faturaNo)} numaralı faturamızın vadesi <strong>${girdi.gecikmeGunu} gün önce</strong> (${tarihFormat(girdi.vadeTarihi)}) doldu ve ödeme kayıtlarımıza hâlâ ulaşmadı. Konuyu önemle dikkatinize sunuyoruz.`,
      `Ödemenin en geç birkaç iş günü içinde yapılmasını rica ediyoruz. Ödeme planında bir zorluk yaşıyorsanız, birlikte bir çözüm bulmak için bu e-postayı yanıtlamanızı memnuniyetle karşılarız.`,
      `İş birliğiniz için şimdiden teşekkür ederiz.`,
    ];
    return {
      konu: `Önemli: ${girdi.faturaNo} numaralı fatura ${girdi.gecikmeGunu} gündür ödenmedi`,
      html: htmlSar(girdi, paragraflar),
      metin: metinYap(girdi, paragraflar),
    };
  },
};

export function sablonUret(
  sablonKodu: string,
  girdi: SablonGirdisi
): EpostaIcerik {
  const uretici = SABLONLAR[sablonKodu] ?? SABLONLAR.nazik_gecikme;
  return uretici(girdi);
}
