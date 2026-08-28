import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const KORUMASIZ_YOLLAR = [
  "/",
  "/giris",
  "/kayit",
  "/sifremi-unuttum",
  "/auth",
  "/pilot",
  "/gizlilik",
  "/kullanim-kosullari",
  // Verified via svix signature, not session; /api/veri-indir stays protected.
  "/api/webhooks",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: don't put code between createServerClient and getUser.
  // getUser() validates the session server-side on every request and
  // refreshes an expired access token using the refresh token; the
  // refreshed cookies are written to supabaseResponse.
  // (getClaims only validates the JWT locally and doesn't refresh it when
  // expired — the user would eventually be forced to sign in again.)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const korumasiz = KORUMASIZ_YOLLAR.some(
    (yol) => pathname === yol || pathname.startsWith(`${yol}/`)
  );

  if (!user && !korumasiz) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    // Preserve the refreshed session cookies on the redirect too.
    const yonlendirme = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cerez) => {
      yonlendirme.cookies.set(cerez);
    });
    return yonlendirme;
  }

  return supabaseResponse;
}
