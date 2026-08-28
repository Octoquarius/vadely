import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Resend webhook (svix signature scheme): processes email
// opened/clicked/bounced events into reminder statuses. If
// RESEND_WEBHOOK_SECRET is not defined, the endpoint is disabled.

function imzaDogrula(
  gizliAnahtar: string,
  mesajId: string,
  zamanDamgasi: string,
  govde: string,
  imzaBasligi: string
): boolean {
  const anahtar = Buffer.from(gizliAnahtar.replace(/^whsec_/, ""), "base64");
  const beklenen = createHmac("sha256", anahtar)
    .update(`${mesajId}.${zamanDamgasi}.${govde}`)
    .digest("base64");

  // The header may contain multiple signatures in the form
  // "v1,signature1 v1,signature2"
  for (const parca of imzaBasligi.split(" ")) {
    const [, imza] = parca.split(",");
    if (!imza) continue;
    const a = Buffer.from(beklenen);
    const b = Buffer.from(imza);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

// Replay window: if the svix timestamp is outside ±5 minutes, the request
// is rejected even if the signature is valid (prevents a captured request
// from being replayed).
const AZAMI_SAPMA_SN = 5 * 60;

function zamanDamgasiGecerli(zamanDamgasi: string): boolean {
  const damga = Number(zamanDamgasi);
  if (!Number.isFinite(damga)) return false;
  const simdi = Math.floor(Date.now() / 1000);
  return Math.abs(simdi - damga) <= AZAMI_SAPMA_SN;
}

const OLAY_ESLEME: Record<string, string> = {
  "email.opened": "acildi",
  "email.clicked": "tiklandi",
  "email.bounced": "gonderim_hatasi",
};

export async function POST(request: Request) {
  const gizliAnahtar = process.env.RESEND_WEBHOOK_SECRET;
  if (!gizliAnahtar) {
    return NextResponse.json({ hata: "not configured" }, { status: 503 });
  }

  const govde = await request.text();
  const mesajId = request.headers.get("svix-id") ?? "";
  const zamanDamgasi = request.headers.get("svix-timestamp") ?? "";
  const imza = request.headers.get("svix-signature") ?? "";

  if (
    !mesajId ||
    !zamanDamgasi ||
    !imza ||
    !zamanDamgasiGecerli(zamanDamgasi) ||
    !imzaDogrula(gizliAnahtar, mesajId, zamanDamgasi, govde, imza)
  ) {
    return NextResponse.json({ hata: "invalid signature" }, { status: 401 });
  }

  let yuk: { type?: string; data?: { email_id?: string } };
  try {
    yuk = JSON.parse(govde);
  } catch {
    return NextResponse.json({ hata: "invalid body" }, { status: 400 });
  }

  const olay = OLAY_ESLEME[yuk.type ?? ""];
  const epostaId = yuk.data?.email_id;

  if (olay && epostaId) {
    const supabase = await createClient();
    await supabase.rpc("eposta_olayi_isle", {
      p_mesaj_id: epostaId,
      p_olay: olay,
    });
  }

  return NextResponse.json({ tamam: true });
}
