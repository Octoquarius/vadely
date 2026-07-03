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
      return { hata: "E-posta veya şifre hatalı." };
    }
    if (error.code === "email_not_confirmed") {
      return { hata: "E-posta adresiniz henüz onaylanmamış. Gelen kutunuzu kontrol edin." };
    }
    return { hata: "Giriş yapılamadı. Lütfen tekrar deneyin." };
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
    return { hata: "Şifre en az 8 karakter olmalı." };
  }

  const { error } = await supabase.auth.signUp({
    email: String(formData.get("eposta") ?? ""),
    password: sifre,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        sirket_adi: String(formData.get("sirket_adi") ?? ""),
        ad_soyad: String(formData.get("ad_soyad") ?? ""),
      },
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { hata: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin." };
    }
    return { hata: "Kayıt tamamlanamadı. Lütfen tekrar deneyin." };
  }

  return {
    mesaj:
      "Kayıt alındı! E-posta adresinize gönderilen onay bağlantısına tıklayın, sonra giriş yapın.",
  };
}

export async function cikisYap() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/giris");
}
