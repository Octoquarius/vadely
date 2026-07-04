import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PilotBasvuru = {
  id: string;
  sirket_adi: string;
  ad_soyad: string;
  eposta: string;
  telefon: string | null;
  aylik_fatura_adedi: string | null;
  kullanilan_yazilim: string | null;
  mesaj: string | null;
  created_at: string;
};

function tarih(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PilotBasvurulari() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("yonetim_pilot_basvurulari");
  const basvurular = (data as PilotBasvuru[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Pilot Başvuruları ({basvurular.length})
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pazarlama sayfasındaki formdan gelen başvurular (en yeni önce).
        </p>
      </div>

      {basvurular.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-12 text-center text-sm text-zinc-500">
          Henüz başvuru yok.
        </div>
      ) : (
        <div className="space-y-3">
          {basvurular.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-zinc-900">{b.sirket_adi}</p>
                  <p className="text-sm text-zinc-600">
                    {b.ad_soyad} ·{" "}
                    <a
                      href={`mailto:${b.eposta}`}
                      className="text-indigo-600 underline"
                    >
                      {b.eposta}
                    </a>
                    {b.telefon && <> · {b.telefon}</>}
                  </p>
                </div>
                <span className="text-xs text-zinc-400">
                  {tarih(b.created_at)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                {b.aylik_fatura_adedi && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                    Aylık fatura: {b.aylik_fatura_adedi}
                  </span>
                )}
                {b.kullanilan_yazilim && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                    Yazılım: {b.kullanilan_yazilim}
                  </span>
                )}
              </div>
              {b.mesaj && (
                <p className="mt-2 whitespace-pre-wrap rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                  {b.mesaj}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
