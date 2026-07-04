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

  // KVKK açık rızası: tarayıcı onay kutusu atlanabildiği için sunucuda da
  // zorunlu tutulur ve rıza zamanı denetlenebilir bir kayıt olarak saklanır.
  if (!formData.get("kvkk_onay")) {
    return {
      hata: "Kullanım Koşulları ve KVKK Aydınlatma Metni'ni onaylamalısınız.",
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

export async function sifreSifirlaIste(
  _onceki: AuthDurum,
  formData: FormData
): Promise<AuthDurum> {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? "http://localhost:3000";

  const eposta = String(formData.get("eposta") ?? "").trim();
  if (!eposta.includes("@")) {
    return { hata: "Geçerli bir e-posta adresi girin." };
  }

  // Kurtarma bağlantısı /auth/callback'e gelir, oradan /sifre-yenile'ye
  // yönlenir (kurtarma oturumu kurulmuş olur).
  await supabase.auth.resetPasswordForEmail(eposta, {
    redirectTo: `${origin}/auth/callback?next=/sifre-yenile`,
  });

  // Kullanıcı numaralandırmasını (enumeration) önlemek için her zaman aynı
  // yanıt verilir — e-posta kayıtlı olsun olmasın.
  return {
    mesaj:
      "Bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzu (ve spam klasörünü) kontrol edin.",
  };
}

export async function sifreGuncelle(
  _onceki: AuthDurum,
  formData: FormData
): Promise<AuthDurum> {
  const sifre = String(formData.get("sifre") ?? "");
  const sifreTekrar = String(formData.get("sifre_tekrar") ?? "");

  if (sifre.length < 8) {
    return { hata: "Şifre en az 8 karakter olmalı." };
  }
  if (sifre !== sifreTekrar) {
    return { hata: "Şifreler eşleşmiyor." };
  }

  const supabase = await createClient();
  // Kurtarma oturumu gerektirir; bağlantı olmadan gelen istek yetkisizdir.
  const { error } = await supabase.auth.updateUser({ password: sifre });
  if (error) {
    return {
      hata: "Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir; sıfırlamayı tekrar isteyin.",
    };
  }

  redirect("/panel");
}
