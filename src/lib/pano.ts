// DSO dashboard calculations — pure functions (unit-testable).
// DSO approach (MVP): the amount-weighted average of the realized collection
// time for closed invoices. The classic formula (average receivables /
// credit sales) requires period-revenue data; a closure-based measurement
// can be computed from SME data on day one and directly answers the
// question "are reminders working?"

export type AcikFatura = {
  id: string;
  musteri_id: string;
  musteri_unvan: string;
  fatura_no: string;
  fatura_tarihi: string; // ISO
  vade_tarihi: string; // ISO
  kalan_bakiye: number;
};

export type KapanmaKaydi = {
  fatura_id: string;
  fatura_tarihi: string; // ISO
  fatura_tutari: number;
  odeme_tarihi: string; // ISO (payment for the match)
  eslesme_tutari: number;
};

export type GonderilmisHatirlatma = {
  fatura_id: string;
  gonderilen_zaman: string; // ISO timestamptz
};

function gunFarki(sonIso: string, ilkIso: string): number {
  const son = new Date(`${sonIso.slice(0, 10)}T00:00:00Z`).getTime();
  const ilk = new Date(`${ilkIso.slice(0, 10)}T00:00:00Z`).getTime();
  return Math.round((son - ilk) / 86400000);
}

// ---- Aging ----

export type YaslandirmaKovasi = {
  etiket: string;
  toplam: number;
  adet: number;
};

export function yaslandirmaHesapla(
  faturalar: AcikFatura[],
  bugunIso: string
): YaslandirmaKovasi[] {
  const kovalar: YaslandirmaKovasi[] = [
    { etiket: "Not yet due", toplam: 0, adet: 0 },
    { etiket: "1-30 days overdue", toplam: 0, adet: 0 },
    { etiket: "31-60 days overdue", toplam: 0, adet: 0 },
    { etiket: "61-90 days overdue", toplam: 0, adet: 0 },
    { etiket: "90+ days overdue", toplam: 0, adet: 0 },
  ];

  for (const fatura of faturalar) {
    const gecikme = gunFarki(bugunIso, fatura.vade_tarihi);
    const indeks =
      gecikme <= 0 ? 0 : gecikme <= 30 ? 1 : gecikme <= 60 ? 2 : gecikme <= 90 ? 3 : 4;
    kovalar[indeks].toplam += fatura.kalan_bakiye;
    kovalar[indeks].adet += 1;
  }
  return kovalar;
}

// ---- Realized DSO ----

/** Per-invoice closure: the last payment date. Only fully closed invoices
 *  are counted (the closure list is already sourced from status=kapali
 *  invoices). */
export function faturaKapanmalari(
  kayitlar: KapanmaKaydi[]
): { fatura_id: string; tutar: number; tahsilSuresi: number; kapanmaTarihi: string }[] {
  const gruplar = new Map<string, KapanmaKaydi[]>();
  for (const kayit of kayitlar) {
    const liste = gruplar.get(kayit.fatura_id) ?? [];
    liste.push(kayit);
    gruplar.set(kayit.fatura_id, liste);
  }

  const sonuc: {
    fatura_id: string;
    tutar: number;
    tahsilSuresi: number;
    kapanmaTarihi: string;
  }[] = [];
  for (const [faturaId, liste] of gruplar) {
    const kapanma = liste.reduce(
      (enSon, kayit) =>
        kayit.odeme_tarihi > enSon ? kayit.odeme_tarihi : enSon,
      liste[0].odeme_tarihi
    );
    sonuc.push({
      fatura_id: faturaId,
      tutar: liste[0].fatura_tutari,
      tahsilSuresi: Math.max(0, gunFarki(kapanma, liste[0].fatura_tarihi)),
      kapanmaTarihi: kapanma.slice(0, 10),
    });
  }
  return sonuc;
}

/** Amount-weighted average collection time (days); null if no data. */
export function gerceklesenDso(
  kayitlar: KapanmaKaydi[],
  bugunIso: string,
  sonGun = 90
): number | null {
  const kapanmalar = faturaKapanmalari(kayitlar).filter(
    (k) => gunFarki(bugunIso, k.kapanmaTarihi) <= sonGun
  );
  const toplamTutar = kapanmalar.reduce((t, k) => t + k.tutar, 0);
  if (toplamTutar <= 0) return null;
  const agirlikli = kapanmalar.reduce(
    (t, k) => t + k.tahsilSuresi * k.tutar,
    0
  );
  return Math.round(agirlikli / toplamTutar);
}

export type AylikDso = { ay: string; dso: number; adet: number }; // ay: "2026-06"

/** Monthly DSO series by closure month (last N months, oldest to newest). */
export function aylikDsoSerisi(
  kayitlar: KapanmaKaydi[],
  bugunIso: string,
  aySayisi = 6
): AylikDso[] {
  const kapanmalar = faturaKapanmalari(kayitlar);
  const gruplar = new Map<string, { toplamTutar: number; agirlikli: number; adet: number }>();
  for (const kapanma of kapanmalar) {
    const ay = kapanma.kapanmaTarihi.slice(0, 7);
    const grup = gruplar.get(ay) ?? { toplamTutar: 0, agirlikli: 0, adet: 0 };
    grup.toplamTutar += kapanma.tutar;
    grup.agirlikli += kapanma.tahsilSuresi * kapanma.tutar;
    grup.adet += 1;
    gruplar.set(ay, grup);
  }

  const sonuc: AylikDso[] = [];
  const bugun = new Date(`${bugunIso}T00:00:00Z`);
  for (let i = aySayisi - 1; i >= 0; i--) {
    const tarih = new Date(Date.UTC(bugun.getUTCFullYear(), bugun.getUTCMonth() - i, 1));
    const ay = tarih.toISOString().slice(0, 7);
    const grup = gruplar.get(ay);
    if (grup && grup.toplamTutar > 0) {
      sonuc.push({
        ay,
        dso: Math.round(grup.agirlikli / grup.toplamTutar),
        adet: grup.adet,
      });
    } else {
      sonuc.push({ ay, dso: 0, adet: 0 });
    }
  }
  return sonuc;
}

// ---- At-risk lists ----

export type RiskliMusteri = {
  musteri_id: string;
  unvan: string;
  acikBakiye: number;
  enUzunGecikme: number;
  faturaAdedi: number;
};

export function riskliMusteriler(
  faturalar: AcikFatura[],
  bugunIso: string,
  adet = 10
): RiskliMusteri[] {
  const gruplar = new Map<string, RiskliMusteri>();
  for (const fatura of faturalar) {
    const gecikme = gunFarki(bugunIso, fatura.vade_tarihi);
    const grup = gruplar.get(fatura.musteri_id) ?? {
      musteri_id: fatura.musteri_id,
      unvan: fatura.musteri_unvan,
      acikBakiye: 0,
      enUzunGecikme: -9999,
      faturaAdedi: 0,
    };
    grup.acikBakiye += fatura.kalan_bakiye;
    grup.enUzunGecikme = Math.max(grup.enUzunGecikme, gecikme);
    grup.faturaAdedi += 1;
    gruplar.set(fatura.musteri_id, grup);
  }
  return [...gruplar.values()]
    .filter((grup) => grup.enUzunGecikme > 0)
    .sort(
      (a, b) =>
        b.enUzunGecikme - a.enUzunGecikme || b.acikBakiye - a.acikBakiye
    )
    .slice(0, adet);
}

export function riskliFaturalar(
  faturalar: AcikFatura[],
  bugunIso: string,
  adet = 10
): (AcikFatura & { gecikme: number })[] {
  return faturalar
    .map((fatura) => ({
      ...fatura,
      gecikme: gunFarki(bugunIso, fatura.vade_tarihi),
    }))
    .filter((fatura) => fatura.gecikme > 0)
    .sort((a, b) => b.gecikme - a.gecikme || b.kalan_bakiye - a.kalan_bakiye)
    .slice(0, adet);
}

// ---- Cash pulled forward (North Star) ----

/**
 * The total of payment matches that arrive after a reminder was sent
 * (within 30 days): the "cash reminders helped collect" approach
 * (ASSUMPTION: correlation, not causation; it's presented that way in the
 * dashboard copy).
 */
export function oneCekilenNakit(
  eslesmeler: KapanmaKaydi[],
  hatirlatmalar: GonderilmisHatirlatma[],
  penceresiGun = 30
): { toplam: number; faturaAdedi: number } {
  const faturaHatirlatmalari = new Map<string, string[]>();
  for (const hatirlatma of hatirlatmalar) {
    const liste = faturaHatirlatmalari.get(hatirlatma.fatura_id) ?? [];
    liste.push(hatirlatma.gonderilen_zaman.slice(0, 10));
    faturaHatirlatmalari.set(hatirlatma.fatura_id, liste);
  }

  let toplam = 0;
  const faturalar = new Set<string>();
  for (const eslesme of eslesmeler) {
    const gonderimler = faturaHatirlatmalari.get(eslesme.fatura_id);
    if (!gonderimler) continue;
    const odemeGunu = eslesme.odeme_tarihi.slice(0, 10);
    const uygun = gonderimler.some((gonderim) => {
      const fark = gunFarki(odemeGunu, gonderim);
      return fark >= 0 && fark <= penceresiGun;
    });
    if (uygun) {
      toplam += eslesme.eslesme_tutari;
      faturalar.add(eslesme.fatura_id);
    }
  }
  return { toplam, faturaAdedi: faturalar.size };
}
