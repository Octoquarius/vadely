// Provider-agnostic email sending layer.
// The active provider is chosen via environment variables; adding another
// service instead of Resend (Postmark, SES...) just means implementing this
// interface with a new object.

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
        // Resend test mode: with an unverified domain / onboarding@resend.dev,
        // sending only works to the account owner's own email address.
        if (
          cevap.status === 403 &&
          /verify a domain|testing emails|own email/i.test(govde)
        ) {
          return {
            tamam: false,
            hata:
              "Resend is in test mode: you can only send to your own email address. " +
              "To send to customers, verify a domain at resend.com/domains " +
              "and update MAIL_FROM to an address on that domain.",
          };
        }
        return {
          tamam: false,
          hata: `Resend ${cevap.status}: ${govde.slice(0, 300)}`,
        };
      }

      const veri = (await cevap.json()) as { id?: string };
      return { tamam: true, mesajId: veri.id ?? "unknown" };
    } catch (hata) {
      return {
        tamam: false,
        hata: `Network error: ${hata instanceof Error ? hata.message : String(hata)}`,
      };
    }
  }
}

/**
 * Returns the configured sender; null if RESEND_API_KEY isn't set.
 * The caller should report the null case to the user in a clear way.
 */
export function gondericiOlustur(): EpostaGonderici | null {
  const apiAnahtari = process.env.RESEND_API_KEY;
  if (!apiAnahtari) return null;

  const kimden = process.env.MAIL_FROM ?? "Vadely <onboarding@resend.dev>";
  return new ResendGonderici(apiAnahtari, kimden);
}
