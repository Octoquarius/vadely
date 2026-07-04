import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// E-posta onayı / şifre kurtarma sonrası Supabase buraya ?code=... ile
// yönlendirir (PKCE akışı). ?next= ile hedef sayfa belirtilebilir (şifre
// kurtarmada /sifre-yenile).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Açık yönlendirme (open redirect) önlemek için yalnızca site içi,
  // "//" ile başlamayan göreli yollar kabul edilir.
  const istenenHedef = searchParams.get("next") ?? "/panel";
  const hedef =
    istenenHedef.startsWith("/") && !istenenHedef.startsWith("//")
      ? istenenHedef
      : "/panel";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${hedef}`);
    }
  }

  return NextResponse.redirect(`${origin}/giris?hata=onay`);
}
