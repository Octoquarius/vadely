import { createClient } from "@/lib/supabase/server";
import { denemeKalanGun, PAKET_ETIKETLERI } from "@/lib/paketler";
import { PaketSecici } from "./paket-secici";

export default async function PaketSayfasi() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const [{ data: hesap }, { data: profil }] = await Promise.all([
    supabase
      .from("hesaplar")
      .select("paket, paket_donemi, created_at")
      .single(),
    supabase
      .from("kullanici_profilleri")
      .select("rol")
      .eq("id", data?.claims?.sub ?? "")
      .single(),
  ]);

  const paket = hesap?.paket ?? "deneme";
  const kalanGun = hesap ? denemeKalanGun(hesap.created_at) : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Paketler</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Mevcut paketiniz:{" "}
          <span className="font-medium text-zinc-900">
            {PAKET_ETIKETLERI[paket] ?? paket}
          </span>
          {paket === "deneme" &&
            (kalanGun > 0
              ? ` — tüm özellikler açık, ${kalanGun} gün kaldı`
              : " — deneme süresi doldu, Başlangıç kapsamında çalışıyorsunuz")}
        </p>
      </div>
      <PaketSecici
        aktifPaket={paket}
        aktifDonem={hesap?.paket_donemi ?? "aylik"}
        secebilir={profil?.rol === "sahip"}
      />
    </div>
  );
}
