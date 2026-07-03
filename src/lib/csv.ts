// CSV ayrıştırma ve Türkçe biçim (sayı/tarih) yardımcıları.
// Türkçe Excel çıktıları için: noktalı virgül ayracı, "1.234,56" sayılar,
// "gg.aa.yyyy" tarihler ve Windows-1254 kodlaması desteklenir.

export type CsvTablo = {
  basliklar: string[];
  satirlar: string[][];
};

/** Dosya baytlarını metne çevirir; UTF-8 değilse Windows-1254 dener. */
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

/** İlk satırdaki (tırnak dışı) sayıya göre ayracı tahmin eder. */
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

/** Tırnak destekli CSV ayrıştırıcı (RFC 4180 uyumlu durum makinesi). */
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

/** "1.234,56", "1234.56", "1234" gibi biçimleri sayıya çevirir; olmazsa null. */
export function sayiAyristir(ham: string): number | null {
  const temiz = ham.replace(/[₺TL\s]/gi, "").trim();
  if (!temiz) return null;

  let normalize: string;
  const sonVirgul = temiz.lastIndexOf(",");
  const sonNokta = temiz.lastIndexOf(".");

  if (sonVirgul !== -1 && sonNokta !== -1) {
    // İki ayraç da var: son görünen ondalık ayracıdır
    normalize =
      sonVirgul > sonNokta
        ? temiz.replace(/\./g, "").replace(",", ".")
        : temiz.replace(/,/g, "");
  } else if (sonVirgul !== -1) {
    // Yalnız virgül: "1,234,567" gibi binlik dizisi değilse ondalıktır
    normalize = /^\d{1,3}(,\d{3}){2,}$/.test(temiz)
      ? temiz.replace(/,/g, "")
      : temiz.replace(/,/g, ".");
  } else if (sonNokta !== -1) {
    // Yalnız nokta: "1.234" / "1.234.567" binlik desenidir
    normalize = /^\d{1,3}(\.\d{3})+$/.test(temiz)
      ? temiz.replace(/\./g, "")
      : temiz;
  } else {
    normalize = temiz;
  }

  const sayi = Number(normalize);
  return Number.isFinite(sayi) ? sayi : null;
}

/** "gg.aa.yyyy", "gg/aa/yyyy", "yyyy-aa-gg" → ISO (yyyy-aa-gg); olmazsa null. */
export function tarihAyristir(ham: string): string | null {
  const temiz = ham.trim().split(" ")[0]; // olası saat kısmını at
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
  { anahtar: "musteri_unvan", etiket: "Müşteri unvanı", zorunlu: true },
  { anahtar: "fatura_no", etiket: "Fatura no", zorunlu: true },
  { anahtar: "fatura_tarihi", etiket: "Fatura tarihi", zorunlu: true },
  { anahtar: "vade_tarihi", etiket: "Vade tarihi", zorunlu: false },
  { anahtar: "tutar", etiket: "Tutar", zorunlu: true },
  { anahtar: "vkn", etiket: "VKN", zorunlu: false },
  { anahtar: "eposta", etiket: "Müşteri e-postası", zorunlu: false },
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

/** Başlık adlarından alan → kolon indeksi tahmini üretir. */
export function kolonlariTahminEt(
  basliklar: string[]
): Partial<Record<AlanAnahtari, number>> {
  const normaller = basliklar.map(basligiNormallestir);
  const sonuc: Partial<Record<AlanAnahtari, number>> = {};
  const kullanilan = new Set<number>();

  for (const alan of ESLENEBILIR_ALANLAR) {
    for (const ipucu of BASLIK_IPUCLARI[alan.anahtar]) {
      const indeks = normaller.findIndex(
        (b, i) => !kullanilan.has(i) && b.includes(ipucu)
      );
      if (indeks !== -1) {
        sonuc[alan.anahtar] = indeks;
        kullanilan.add(indeks);
        break;
      }
    }
  }
  return sonuc;
}
