import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Resend webhook'u (svix imza şeması): e-posta açılma/tıklanma/bounce
// olaylarını hatırlatma durumlarına işler. RESEND_WEBHOOK_SECRET tanımlı
// değilse uç nokta kapalıdır.

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

  // Başlık "v1,imza1 v1,imza2" biçiminde birden çok imza içerebilir
  for (const parca of imzaBasligi.split(" ")) {
    const [, imza] = parca.split(",");
    if (!imza) continue;
    const a = Buffer.from(beklenen);
    const b = Buffer.from(imza);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

const OLAY_ESLEME: Record<string, string> = {
  "email.opened": "acildi",
  "email.clicked": "tiklandi",
  "email.bounced": "gonderim_hatasi",
};

export async function POST(request: Request) {
  const gizliAnahtar = process.env.RESEND_WEBHOOK_SECRET;
  if (!gizliAnahtar) {
    return NextResponse.json({ hata: "yapilandirilmamis" }, { status: 503 });
  }

  const govde = await request.text();
  const mesajId = request.headers.get("svix-id") ?? "";
  const zamanDamgasi = request.headers.get("svix-timestamp") ?? "";
  const imza = request.headers.get("svix-signature") ?? "";

  if (
    !mesajId ||
    !zamanDamgasi ||
    !imza ||
    !imzaDogrula(gizliAnahtar, mesajId, zamanDamgasi, govde, imza)
  ) {
    return NextResponse.json({ hata: "gecersiz imza" }, { status: 401 });
  }

  let yuk: { type?: string; data?: { email_id?: string } };
  try {
    yuk = JSON.parse(govde);
  } catch {
    return NextResponse.json({ hata: "gecersiz govde" }, { status: 400 });
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
