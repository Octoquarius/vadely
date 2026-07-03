// UBL-TR (GİB e-Fatura / e-Arşiv) Invoice XML ayrıştırıcısı.
// Yalnızca temel DOM API'leri kullanır (documentElement, childNodes,
// localName, textContent, getAttribute) — tarayıcıda DOMParser, testte
// @xmldom/xmldom ile aynı şekilde çalışır. Ad alanı (namespace) ön ekleri
// yerine localName ile eşleşir; entegratörler arası ön ek farklarından
// etkilenmez.

export type UblFatura = {
  gib_uuid: string | null;
  fatura_no: string;
  fatura_tarihi: string; // ISO yyyy-aa-gg
  vade_tarihi: string | null; // yoksa çağıran taraf doldurur
  tutar: number;
  para_birimi: string;
  musteri_unvan: string;
  vkn: string | null;
  eposta: string | null;
};

export type UblSonuc =
  | { tamam: true; fatura: UblFatura }
  | { tamam: false; hata: string };

function elemanCocuklar(dugum: { childNodes: ArrayLike<Node> }): Element[] {
  const sonuc: Element[] = [];
  for (let i = 0; i < dugum.childNodes.length; i++) {
    const cocuk = dugum.childNodes[i];
    if (cocuk.nodeType === 1) sonuc.push(cocuk as Element);
  }
  return sonuc;
}

/** Doğrudan alt elemanlar içinde localName eşleşenleri döndürür. */
function cocuklar(eleman: Element, yerelAd: string): Element[] {
  return elemanCocuklar(eleman).filter((c) => c.localName === yerelAd);
}

/** localName zinciriyle ilk eşleşen torunu bulur (her adımda ilk eşleşme). */
function bul(eleman: Element, ...yol: string[]): Element | null {
  let simdiki: Element | null = eleman;
  for (const ad of yol) {
    if (!simdiki) return null;
    simdiki = cocuklar(simdiki, ad)[0] ?? null;
  }
  return simdiki;
}

function metin(eleman: Element | null): string {
  return (eleman?.textContent ?? "").trim();
}

function isoTarih(ham: string): string | null {
  const eslesme = ham.match(/^(\d{4}-\d{2}-\d{2})/);
  return eslesme ? eslesme[1] : null;
}

export function ublFaturaAyristir(
  belge: Document,
  dosyaAdi: string
): UblSonuc {
  const hataYap = (mesaj: string): UblSonuc => ({
    tamam: false,
    hata: `${dosyaAdi}: ${mesaj}`,
  });

  // Tarayıcı DOMParser hatada <parsererror> içeren belge döndürür
  if (belge.getElementsByTagName("parsererror").length > 0) {
    return hataYap("XML okunamadı (bozuk dosya).");
  }

  const kok = belge.documentElement;
  if (!kok || kok.localName !== "Invoice") {
    return hataYap(
      `UBL fatura belgesi değil (kök eleman: ${kok?.localName ?? "yok"}).`
    );
  }

  const faturaNo = metin(bul(kok, "ID"));
  if (!faturaNo) return hataYap("Fatura numarası (cbc:ID) bulunamadı.");

  const faturaTarihi = isoTarih(metin(bul(kok, "IssueDate")));
  if (!faturaTarihi) return hataYap("Fatura tarihi (cbc:IssueDate) okunamadı.");

  // Vade: önce fatura düzeyi DueDate, yoksa PaymentMeans/PaymentDueDate
  let vadeTarihi = isoTarih(metin(bul(kok, "DueDate")));
  if (!vadeTarihi) {
    for (const odemeAraci of cocuklar(kok, "PaymentMeans")) {
      vadeTarihi = isoTarih(metin(bul(odemeAraci, "PaymentDueDate")));
      if (vadeTarihi) break;
    }
  }

  const odenecekEleman = bul(kok, "LegalMonetaryTotal", "PayableAmount");
  const tutar = Number(metin(odenecekEleman));
  if (!odenecekEleman || !Number.isFinite(tutar)) {
    return hataYap("Ödenecek tutar (PayableAmount) okunamadı.");
  }
  if (tutar <= 0) {
    return hataYap("Ödenecek tutar sıfır — alacak takibine eklenmedi.");
  }
  const paraBirimi =
    odenecekEleman.getAttribute("currencyID")?.trim() || "TRY";

  // Alıcı (müşteri) bilgileri
  const taraf = bul(kok, "AccountingCustomerParty", "Party");
  if (!taraf) return hataYap("Alıcı bilgisi (AccountingCustomerParty) yok.");

  let unvan = metin(bul(taraf, "PartyName", "Name"));
  if (!unvan) {
    // e-Arşiv bireysel müşteri: Ad + Soyad
    const kisi = bul(taraf, "Person");
    if (kisi) {
      unvan = [metin(bul(kisi, "FirstName")), metin(bul(kisi, "FamilyName"))]
        .filter(Boolean)
        .join(" ");
    }
  }
  if (!unvan) return hataYap("Müşteri unvanı bulunamadı.");

  let vkn: string | null = null;
  for (const kimlik of cocuklar(taraf, "PartyIdentification")) {
    const kimlikId = bul(kimlik, "ID");
    const sema = kimlikId?.getAttribute("schemeID")?.toUpperCase() ?? "";
    if (sema === "VKN" || sema === "TCKN") {
      vkn = metin(kimlikId);
      break;
    }
  }

  const eposta = metin(bul(taraf, "Contact", "ElectronicMail")) || null;
  const gibUuid = metin(bul(kok, "UUID")) || null;

  return {
    tamam: true,
    fatura: {
      gib_uuid: gibUuid,
      fatura_no: faturaNo,
      fatura_tarihi: faturaTarihi,
      vade_tarihi: vadeTarihi,
      tutar,
      para_birimi: paraBirimi,
      musteri_unvan: unvan,
      vkn,
      eposta,
    },
  };
}
