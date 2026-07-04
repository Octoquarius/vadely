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
  // Oturumla değil svix imzasıyla doğrulanır; /api/veri-indir korumalı kalır.
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

  // ÖNEMLİ: createServerClient ile getClaims arasına kod koyma;
  // oturum tazeleme bu çağrıyla tetiklenir.
  const { data } = await supabase.auth.getClaims();

  const { pathname } = request.nextUrl;
  const korumasiz = KORUMASIZ_YOLLAR.some(
    (yol) => pathname === yol || pathname.startsWith(`${yol}/`)
  );

  if (!data?.claims && !korumasiz) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
