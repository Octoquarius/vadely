import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// After email confirmation / password recovery, Supabase redirects here
// with ?code=... (PKCE flow). The target page can be specified with ?next=
// (/sifre-yenile for password recovery).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // To prevent open redirect, only in-site relative paths that don't
  // start with "//" are accepted.
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
