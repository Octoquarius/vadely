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

  // ÖNEMLİ: createServerClient ile getUser arasına kod koyma. getUser()
  // her istekte oturumu sunucuda doğrular ve süresi dolan access token'ı
  // refresh token'la yeniler; yenilenen çerezler supabaseResponse'a yazılır.
  // (getClaims yalnızca JWT'yi yerel doğrular; süresi dolduğunda yenilemez —
  // kullanıcı bir süre sonra "yeniden giriş" yapmak zorunda kalırdı.)
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
    // Yönlendirmede de tazelenen oturum çerezlerini koru.
    const yonlendirme = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cerez) => {
      yonlendirme.cookies.set(cerez);
    });
    return yonlendirme;
  }

  return supabaseResponse;
}
