// UBL-TR (GİB e-Invoice / e-Archive) Invoice XML parser.
// Uses only basic DOM APIs (documentElement, childNodes, localName,
// textContent, getAttribute) — works identically with the browser's
// DOMParser and with @xmldom/xmldom in tests. Matches by localName rather
// than namespace prefix, so it isn't affected by prefix differences between
// integrators.

export type UblFatura = {
  gib_uuid: string | null;
  fatura_no: string;
  fatura_tarihi: string; // ISO yyyy-mm-dd
  vade_tarihi: string | null; // if absent, the caller fills it in
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

/** Returns the direct children whose localName matches. */
function cocuklar(eleman: Element, yerelAd: string): Element[] {
  return elemanCocuklar(eleman).filter((c) => c.localName === yerelAd);
}

/** Finds the first descendant matching a chain of localNames (first match at each step). */
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

  // The browser's DOMParser returns a document containing <parsererror> on failure
  if (belge.getElementsByTagName("parsererror").length > 0) {
    return hataYap("Could not read the XML (corrupted file).");
  }

  const kok = belge.documentElement;
  if (!kok || kok.localName !== "Invoice") {
    return hataYap(
      `Not a UBL invoice document (root element: ${kok?.localName ?? "none"}).`
    );
  }

  const faturaNo = metin(bul(kok, "ID"));
  if (!faturaNo) return hataYap("Invoice number (cbc:ID) not found.");

  const faturaTarihi = isoTarih(metin(bul(kok, "IssueDate")));
  if (!faturaTarihi) return hataYap("Could not read the invoice date (cbc:IssueDate).");

  // Due date: invoice-level DueDate first, otherwise PaymentMeans/PaymentDueDate
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
    return hataYap("Could not read the payable amount (PayableAmount).");
  }
  if (tutar <= 0) {
    return hataYap("Payable amount is zero — not added to receivables tracking.");
  }
  const paraBirimi =
    odenecekEleman.getAttribute("currencyID")?.trim() || "TRY";

  // Recipient (customer) details
  const taraf = bul(kok, "AccountingCustomerParty", "Party");
  if (!taraf) return hataYap("Recipient details (AccountingCustomerParty) missing.");

  let unvan = metin(bul(taraf, "PartyName", "Name"));
  if (!unvan) {
    // e-Archive individual customer: first name + last name
    const kisi = bul(taraf, "Person");
    if (kisi) {
      unvan = [metin(bul(kisi, "FirstName")), metin(bul(kisi, "FamilyName"))]
        .filter(Boolean)
        .join(" ");
    }
  }
  if (!unvan) return hataYap("Customer name not found.");

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
