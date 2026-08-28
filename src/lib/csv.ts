// CSV parsing and Turkish-format (number/date) helpers.
// Supports Turkish Excel exports: semicolon delimiter, "1.234,56"-style
// numbers, "dd.mm.yyyy" dates, and Windows-1254 encoding.

export type CsvTablo = {
  basliklar: string[];
  satirlar: string[][];
};

/** Converts file bytes to text; falls back to Windows-1254 if not UTF-8. */
export function baytlariCoz(buffer: ArrayBuffer): string {
  const baytlar = new Uint8Array(buffer);
  // UTF-8 BOM
  if (baytlar[0] === 0xef && baytlar[1] === 0xbb && baytlar[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(baytlar.subarray(3));
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(baytlar);
  } catch {
    return new TextDecoder("windows-1254").decode(baytlar);
  }
}

/** Guesses the delimiter from its (non-quoted) count on the first line. */
function ayracTahminEt(ilkSatir: string): string {
  const adaylar = [";", ",", "\t"];
  let enIyi = ";";
  let enCok = -1;
  for (const aday of adaylar) {
    let sayi = 0;
    let tirnakta = false;
    for (const karakter of ilkSatir) {
      if (karakter === '"') tirnakta = !tirnakta;
      else if (karakter === aday && !tirnakta) sayi++;
    }
    if (sayi > enCok) {
      enCok = sayi;
      enIyi = aday;
    }
  }
  return enIyi;
}

/** Quote-aware CSV parser (RFC 4180-compliant state machine). */
export function csvAyristir(metin: string): CsvTablo {
  const icerik = metin.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const ilkSatirSonu = icerik.indexOf("\n");
  const ayrac = ayracTahminEt(
    ilkSatirSonu === -1 ? icerik : icerik.slice(0, ilkSatirSonu)
  );

  const satirlar: string[][] = [];
  let satir: string[] = [];
  let hucre = "";
  let tirnakta = false;

  for (let i = 0; i < icerik.length; i++) {
    const karakter = icerik[i];
    if (tirnakta) {
      if (karakter === '"') {
        if (icerik[i + 1] === '"') {
          hucre += '"';
          i++;
        } else {
          tirnakta = false;
        }
      } else {
        hucre += karakter;
      }
    } else if (karakter === '"') {
      tirnakta = true;
    } else if (karakter === ayrac) {
      satir.push(hucre);
      hucre = "";
    } else if (karakter === "\n") {
      satir.push(hucre);
      hucre = "";
      if (satir.some((h) => h.trim() !== "")) satirlar.push(satir);
      satir = [];
    } else {
      hucre += karakter;
    }
  }
  satir.push(hucre);
  if (satir.some((h) => h.trim() !== "")) satirlar.push(satir);

  const [basliklar = [], ...veri] = satirlar;
  return { basliklar: basliklar.map((b) => b.trim()), satirlar: veri };
}

/** Converts formats like "1.234,56", "1234.56", "1234" to a number; null if it can't. */
export function sayiAyristir(ham: string): number | null {
  const temiz = ham.replace(/[₺TL\s]/gi, "").trim();
  if (!temiz) return null;

  let normalize: string;
  const sonVirgul = temiz.lastIndexOf(",");
  const sonNokta = temiz.lastIndexOf(".");

  if (sonVirgul !== -1 && sonNokta !== -1) {
    // Both separators present: whichever appears last is the decimal separator
    normalize =
      sonVirgul > sonNokta
        ? temiz.replace(/\./g, "").replace(",", ".")
        : temiz.replace(/,/g, "");
  } else if (sonVirgul !== -1) {
    // Comma only: decimal unless it's a thousands grouping like "1,234,567"
    normalize = /^\d{1,3}(,\d{3}){2,}$/.test(temiz)
      ? temiz.replace(/,/g, "")
      : temiz.replace(/,/g, ".");
  } else if (sonNokta !== -1) {
    // Period only: "1.234" / "1.234.567" is a thousands pattern
    normalize = /^\d{1,3}(\.\d{3})+$/.test(temiz)
      ? temiz.replace(/\./g, "")
      : temiz;
  } else {
    normalize = temiz;
  }

  const sayi = Number(normalize);
  return Number.isFinite(sayi) ? sayi : null;
}

/** "dd.mm.yyyy", "dd/mm/yyyy", "yyyy-mm-dd" → ISO (yyyy-mm-dd); null if it can't. */
export function tarihAyristir(ham: string): string | null {
  const temiz = ham.trim().split(" ")[0]; // drop a possible time portion
  if (!temiz) return null;

  let yil: number, ay: number, gun: number;

  const iso = temiz.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const tr = temiz.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

  if (iso) {
    [yil, ay, gun] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  } else if (tr) {
    [gun, ay, yil] = [Number(tr[1]), Number(tr[2]), Number(tr[3])];
  } else {
    return null;
  }

  if (ay < 1 || ay > 12 || gun < 1 || gun > 31 || yil < 2000 || yil > 2100) {
    return null;
  }
  const tarih = new Date(Date.UTC(yil, ay - 1, gun));
  if (tarih.getUTCMonth() !== ay - 1 || tarih.getUTCDate() !== gun) return null;

  return `${yil}-${String(ay).padStart(2, "0")}-${String(gun).padStart(2, "0")}`;
}

export const ESLENEBILIR_ALANLAR = [
  { anahtar: "musteri_unvan", etiket: "Customer name", zorunlu: true },
  { anahtar: "fatura_no", etiket: "Invoice no", zorunlu: true },
  { anahtar: "fatura_tarihi", etiket: "Invoice date", zorunlu: true },
  { anahtar: "vade_tarihi", etiket: "Due date", zorunlu: false },
  { anahtar: "tutar", etiket: "Amount", zorunlu: true },
  { anahtar: "vkn", etiket: "Tax ID", zorunlu: false },
  { anahtar: "eposta", etiket: "Customer email", zorunlu: false },
] as const;

export type AlanAnahtari = (typeof ESLENEBILIR_ALANLAR)[number]["anahtar"];

const BASLIK_IPUCLARI: Record<AlanAnahtari, string[]> = {
  musteri_unvan: ["musteri", "unvan", "cari", "firma", "alici", "sirket"],
  fatura_no: ["fatura no", "faturano", "belge no", "belgeno", "fatura numar"],
  fatura_tarihi: ["fatura tarih", "duzenleme", "tarih"],
  vade_tarihi: ["vade", "odeme tarih", "son odeme"],
  tutar: ["tutar", "toplam", "meblag", "odenecek"],
  vkn: ["vkn", "vergi no", "vergi kimlik", "tckn"],
  eposta: ["eposta", "e-posta", "email", "mail"],
};

function basligiNormallestir(baslik: string): string {
  return baslik
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

// Detection order: vade_tarihi (due date) is tried before fatura_tarihi
// (invoice date) so a column like "Vade Tarihi" doesn't get swallowed by
// fatura_tarihi's generic "tarih" (date) hint (fatura_tarihi's more specific
// "fatura tarih" hint still takes priority when it matches).
const TAHMIN_SIRASI: AlanAnahtari[] = [
  "musteri_unvan",
  "fatura_no",
  "vkn",
  "eposta",
  "tutar",
  "vade_tarihi",
  "fatura_tarihi",
];

/** Produces a field → column-index guess from the header names. */
export function kolonlariTahminEt(
  basliklar: string[]
): Partial<Record<AlanAnahtari, number>> {
  const normaller = basliklar.map(basligiNormallestir);
  const sonuc: Partial<Record<AlanAnahtari, number>> = {};
  const kullanilan = new Set<number>();

  for (const anahtar of TAHMIN_SIRASI) {
    for (const ipucu of BASLIK_IPUCLARI[anahtar]) {
      const indeks = normaller.findIndex(
        (b, i) => !kullanilan.has(i) && b.includes(ipucu)
      );
      if (indeks !== -1) {
        sonuc[anahtar] = indeks;
        kullanilan.add(indeks);
        break;
      }
    }
  }
  return sonuc;
}
