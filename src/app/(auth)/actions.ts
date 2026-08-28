"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthDurum = { hata?: string; mesaj?: string };

export async function girisYap(
  _onceki: AuthDurum,
  formData: FormData
): Promise<AuthDurum> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("eposta") ?? ""),
    password: String(formData.get("sifre") ?? ""),
  });

  if (error) {
    if (error.code === "invalid_credentials") {
      return { hata: "Incorrect email or password." };
    }
    if (error.code === "email_not_confirmed") {
      return { hata: "Your email address hasn't been confirmed yet. Check your inbox." };
    }
    return { hata: "Login failed. Please try again." };
  }

  redirect("/panel");
}

export async function kayitOl(
  _onceki: AuthDurum,
  formData: FormData
): Promise<AuthDurum> {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? "http://localhost:3000";

  const sifre = String(formData.get("sifre") ?? "");
  if (sifre.length < 8) {
    return { hata: "Password must be at least 8 characters." };
  }

  // Explicit KVKK (Turkish data protection law) consent: since the browser
  // checkbox can be bypassed, it's also enforced server-side, and the consent
  // timestamp is stored as an auditable record.
  if (!formData.get("kvkk_onay")) {
    return {
      hata: "You must accept the Terms of Use and the Privacy Notice.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email: String(formData.get("eposta") ?? ""),
    password: sifre,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        sirket_adi: String(formData.get("sirket_adi") ?? ""),
        ad_soyad: String(formData.get("ad_soyad") ?? ""),
        kvkk_onayi_verildi: true,
        kvkk_onay_zamani: new Date().toISOString(),
      },
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { hata: "An account with this email already exists. Try logging in instead." };
    }
    return { hata: "Registration could not be completed. Please try again." };
  }

  return {
    mesaj:
      "Registration received! Click the confirmation link sent to your email address, then log in.",
  };
}

export async function cikisYap() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/giris");
}

export async function sifreSifirlaIste(
  _onceki: AuthDurum,
  formData: FormData
): Promise<AuthDurum> {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? "http://localhost:3000";

  const eposta = String(formData.get("eposta") ?? "").trim();
  if (!eposta.includes("@")) {
    return { hata: "Enter a valid email address." };
  }

  // The recovery link arrives at /auth/callback, which then redirects to
  // /sifre-yenile (the recovery session gets established there).
  await supabase.auth.resetPasswordForEmail(eposta, {
    redirectTo: `${origin}/auth/callback?next=/sifre-yenile`,
  });

  // To prevent user enumeration, the same response is always returned —
  // whether or not the email is registered.
  return {
    mesaj:
      "If this email is registered, a password reset link has been sent. Check your inbox (and spam folder).",
  };
}

export async function sifreGuncelle(
  _onceki: AuthDurum,
  formData: FormData
): Promise<AuthDurum> {
  const sifre = String(formData.get("sifre") ?? "");
  const sifreTekrar = String(formData.get("sifre_tekrar") ?? "");

  if (sifre.length < 8) {
    return { hata: "Password must be at least 8 characters." };
  }
  if (sifre !== sifreTekrar) {
    return { hata: "Passwords don't match." };
  }

  const supabase = await createClient();
  // Requires a recovery session; a request arriving without the link is unauthorized.
  const { error } = await supabase.auth.updateUser({ password: sifre });
  if (error) {
    return {
      hata: "Password could not be updated. The link may have expired; request a new reset.",
    };
  }

  redirect("/panel");
}
