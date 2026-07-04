"use client";

import { useActionState } from "react";
import { ayarKaydet, type IslemDurum } from "./actions";

const baslangic: IslemDurum = {};

export function AyarFormu({
  hesapAdi,
  gonderimModu,
  duzenleyebilir,
}: {
  hesapAdi: string;
  gonderimModu: string;
  duzenleyebilir: boolean;
}) {
  const [durum, eylem, bekliyor] = useActionState(ayarKaydet, baslangic);

  return (
    <form
      action={eylem}
      className="rounded-xl border border-zinc-200 bg-white p-6"
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="ad"
            className="block text-sm font-medium text-zinc-700"
          >
            Şirket adı
          </label>
          <p className="text-xs text-zinc-500">
            Hatırlatma e-postalarında imza olarak görünür.
          </p>
          <input
            id="ad"
            name="ad"
            defaultValue={hesapAdi}
            required
            disabled={!duzenleyebilir}
            className="mt-2 w-full max-w-md rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-400"
          />
        </div>

        <fieldset disabled={!duzenleyebilir}>
          <legend className="text-sm font-medium text-zinc-700">
            Gönderim modu
          </legend>
          <div className="mt-2 space-y-3">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="radio"
                name="gonderim_modu"
                value="onayli"
                defaultChecked={gonderimModu === "onayli"}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-zinc-900">
                  Göndermeden önce onayla (önerilen)
                </span>
                <br />
                <span className="text-zinc-500">
                  Hatırlatmalar planlanır ama siz &quot;Gönder&quot; demeden
                  hiçbir müşteriye e-posta gitmez.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="radio"
                name="gonderim_modu"
                value="otomatik"
                defaultChecked={gonderimModu === "otomatik"}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-zinc-900">Otomatik gönder</span>
                <br />
                <span className="text-zinc-500">
                  Zamanı gelen hatırlatmalar her sabah kendiliğinden gönderilir.
                  (Bu mod, uygulama yayına alındığında etkinleşir; tercihiniz
                  şimdiden kaydedilir.)
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        {durum.mesaj && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {durum.mesaj}
          </p>
        )}
        {durum.hata && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {durum.hata}
          </p>
        )}

        {duzenleyebilir ? (
          <button
            type="submit"
            disabled={bekliyor}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {bekliyor ? "Kaydediliyor…" : "Kaydet"}
          </button>
        ) : (
          <p className="text-sm text-zinc-500">
            Ayarları yalnızca hesap sahibi değiştirebilir.
          </p>
        )}
      </div>
    </form>
  );
}
