// Collection reminder email templates.
// Tone progression: gentle pre-reminder -> informative due-date notice ->
// gentle overdue -> firm (but never threatening) overdue.
// This copy IS the product's "collection without damaging the relationship"
// promise.

export type SablonGirdisi = {
  gonderenUnvan: string; // the company (tenant) sending the reminder
  musteriUnvan: string;
  faturaNo: string;
  faturaTarihi: string; // ISO
  vadeTarihi: string; // ISO
  kalanBakiye: number;
  paraBirimi: string;
  gecikmeGunu: number; // negative: days remaining until due
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
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// User data such as customer name / invoice number is escaped before being
// embedded in the HTML body (prevents broken rendering / injection). The
// plain-text version is produced by stripping tags from the paragraphs, so
// entities are unescaped again there.
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
<html lang="en">
<body style="margin:0;padding:24px;background-color:#fafafa;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:32px;">
    ${satirlar}
    <table style="width:100%;margin:8px 0 20px 0;border-collapse:collapse;font-size:14px;color:#27272a;">
      <tr>
        <td style="padding:6px 0;color:#71717a;">Invoice no</td>
        <td style="padding:6px 0;text-align:right;font-weight:bold;">${htmlKac(girdi.faturaNo)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#71717a;">Invoice date</td>
        <td style="padding:6px 0;text-align:right;">${tarihFormat(girdi.faturaTarihi)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#71717a;">Due date</td>
        <td style="padding:6px 0;text-align:right;">${tarihFormat(girdi.vadeTarihi)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#71717a;border-top:1px solid #e4e4e7;">Amount due</td>
        <td style="padding:6px 0;text-align:right;font-weight:bold;border-top:1px solid #e4e4e7;">${paraFormat(girdi.kalanBakiye, girdi.paraBirimi)}</td>
      </tr>
    </table>
    <p style="margin:0 0 4px 0;font-size:15px;color:#27272a;">Best regards,</p>
    <p style="margin:0;font-size:15px;font-weight:bold;color:#27272a;">${htmlKac(girdi.gonderenUnvan)}</p>
    <p style="margin:24px 0 0 0;font-size:12px;color:#a1a1aa;">If you've already made this payment, please disregard this email.</p>
  </div>
</body>
</html>`;
}

function metinYap(girdi: SablonGirdisi, paragraflar: string[]): string {
  return [
    ...paragraflar.map((p) => htmlCoz(p.replace(/<[^>]+>/g, ""))),
    "",
    `Invoice no: ${girdi.faturaNo}`,
    `Invoice date: ${tarihFormat(girdi.faturaTarihi)}`,
    `Due date: ${tarihFormat(girdi.vadeTarihi)}`,
    `Amount due: ${paraFormat(girdi.kalanBakiye, girdi.paraBirimi)}`,
    "",
    "Best regards,",
    girdi.gonderenUnvan,
    "",
    "If you've already made this payment, please disregard this email.",
  ].join("\n");
}

type SablonUretici = (girdi: SablonGirdisi) => EpostaIcerik;

const SABLONLAR: Record<string, SablonUretici> = {
  on_hatirlatma: (girdi) => {
    const kalanGun = -girdi.gecikmeGunu;
    const paragraflar = [
      `Dear <strong>${htmlKac(girdi.musteriUnvan)}</strong> team,`,
      `Our invoice ${htmlKac(girdi.faturaNo)} is due ${
        kalanGun > 0 ? `<strong>in ${kalanGun} days</strong>` : "soon"
      } (${tarihFormat(girdi.vadeTarihi)}). We wanted to send a quick heads-up to help with your planning.`,
      `If you've already scheduled the payment, that's great — feel free to disregard this email.`,
    ];
    return {
      konu: `Reminder: invoice ${girdi.faturaNo} is coming due`,
      html: htmlSar(girdi, paragraflar),
      metin: metinYap(girdi, paragraflar),
    };
  },

  vade_gunu: (girdi) => {
    const paragraflar = [
      `Dear <strong>${htmlKac(girdi.musteriUnvan)}</strong> team,`,
      `Our invoice ${htmlKac(girdi.faturaNo)} is due <strong>today</strong> (${tarihFormat(girdi.vadeTarihi)}). You'll find the invoice summary below.`,
      `If your payment is going out today, there's nothing further you need to do. If you have any questions, just reply to this email.`,
    ];
    return {
      konu: `Invoice ${girdi.faturaNo} is due today`,
      html: htmlSar(girdi, paragraflar),
      metin: metinYap(girdi, paragraflar),
    };
  },

  nazik_gecikme: (girdi) => {
    const paragraflar = [
      `Dear <strong>${htmlKac(girdi.musteriUnvan)}</strong> team,`,
      `Our invoice ${htmlKac(girdi.faturaNo)} was due on ${tarihFormat(girdi.vadeTarihi)}; according to our records, the payment hasn't reached us yet. It may simply have slipped by, so we wanted to send a gentle reminder.`,
      `If you made the payment in the last few days, thank you — it can take a few days to show up in our records. If there's a hiccup or you have a question, just reply to this email and we'll work it out together.`,
    ];
    return {
      konu: `Reminder: payment for invoice ${girdi.faturaNo} not showing yet`,
      html: htmlSar(girdi, paragraflar),
      metin: metinYap(girdi, paragraflar),
    };
  },

  kararli_gecikme: (girdi) => {
    const paragraflar = [
      `Dear <strong>${htmlKac(girdi.musteriUnvan)}</strong> team,`,
      `Our invoice ${htmlKac(girdi.faturaNo)} was due <strong>${girdi.gecikmeGunu} days ago</strong> (${tarihFormat(girdi.vadeTarihi)}) and payment still hasn't reached our records. We want to bring this to your attention as a priority.`,
      `We'd appreciate the payment being made within the next few business days at the latest. If you're facing a difficulty with the payment schedule, we're glad to work out a solution together — just reply to this email.`,
      `Thank you in advance for your cooperation.`,
    ];
    return {
      konu: `Important: invoice ${girdi.faturaNo} has been unpaid for ${girdi.gecikmeGunu} days`,
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
