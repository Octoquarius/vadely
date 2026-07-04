// Sağlayıcı-bağımsız e-posta gönderim katmanı.
// Aktif sağlayıcı ortam değişkenleriyle seçilir; Resend yerine başka bir
// servis (Postmark, SES...) eklemek = bu arayüzü uygulayan yeni bir nesne.

import "server-only";
import type { EpostaIcerik } from "./sablonlar";

export type GonderimSonucu =
  | { tamam: true; mesajId: string }
  | { tamam: false; hata: string };

export type EpostaGonderici = {
  gonder(aliciEposta: string, icerik: EpostaIcerik): Promise<GonderimSonucu>;
};

class ResendGonderici implements EpostaGonderici {
  constructor(
    private apiAnahtari: string,
    private kimden: string
  ) {}

  async gonder(
    aliciEposta: string,
    icerik: EpostaIcerik
  ): Promise<GonderimSonucu> {
    try {
      const cevap = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiAnahtari}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.kimden,
          to: [aliciEposta],
          subject: icerik.konu,
          html: icerik.html,
          text: icerik.metin,
        }),
      });

      if (!cevap.ok) {
        const govde = await cevap.text();
        return {
          tamam: false,
          hata: `Resend ${cevap.status}: ${govde.slice(0, 300)}`,
        };
      }

      const veri = (await cevap.json()) as { id?: string };
      return { tamam: true, mesajId: veri.id ?? "bilinmiyor" };
    } catch (hata) {
      return {
        tamam: false,
        hata: `Ağ hatası: ${hata instanceof Error ? hata.message : String(hata)}`,
      };
    }
  }
}

/**
 * Yapılandırılmış göndericiyi döndürür; RESEND_API_KEY tanımlı değilse null.
 * Çağıran taraf null durumunu kullanıcıya anlaşılır biçimde raporlamalı.
 */
export function gondericiOlustur(): EpostaGonderici | null {
  const apiAnahtari = process.env.RESEND_API_KEY;
  if (!apiAnahtari) return null;

  const kimden = process.env.MAIL_FROM ?? "Vadely <onboarding@resend.dev>";
  return new ResendGonderici(apiAnahtari, kimden);
}
