import { createClient } from "@/lib/supabase/server";
import { AyarFormu } from "./ayar-formu";

export default async function AyarlarSayfasi() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const [{ data: hesap }, { data: profil }] = await Promise.all([
    supabase.from("hesaplar").select("ad, gonderim_modu").single(),
    supabase
      .from("kullanici_profilleri")
      .select("rol")
      .eq("id", data?.claims?.sub ?? "")
      .single(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Ayarlar</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Şirket bilgileri ve hatırlatma gönderim tercihi.
        </p>
      </div>
      <AyarFormu
        hesapAdi={hesap?.ad ?? ""}
        gonderimModu={hesap?.gonderim_modu ?? "onayli"}
        duzenleyebilir={profil?.rol === "sahip"}
      />
    </div>
  );
}
