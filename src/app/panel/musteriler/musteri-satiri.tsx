"use client";

import { useActionState, useState } from "react";
import { musteriGuncelle, musteriSil, type IslemDurum } from "../actions";

const bos: IslemDurum = {};

type Musteri = {
  id: string;
  unvan: string;
  vkn: string | null;
  eposta: string | null;
  telefon: string | null;
};

const girdiSinif =
  "rounded-md border border-cizgi bg-white px-2.5 py-1.5 text-sm focus:border-murekkep-2 focus:outline-none";

export function MusteriSatiri({ musteri }: { musteri: Musteri }) {
  const [duzenle, setDuzenle] = useState(false);
  const [silOnay, setSilOnay] = useState(false);
  const [guncelleDurum, guncelleEylem, guncelleniyor] = useActionState(
    musteriGuncelle,
    bos
  );
  const [silDurum, silEylem, siliniyor] = useActionState(musteriSil, bos);

  // Başarılı güncellemede düzenleme modundan çık (render sırasında türetme —
  // önceki render'daki mesajla karşılaştırarak).
  const [sonMesaj, setSonMesaj] = useState<string | undefined>(undefined);
  if (guncelleDurum.mesaj !== sonMesaj) {
    setSonMesaj(guncelleDurum.mesaj);
    if (guncelleDurum.mesaj) setDuzenle(false);
  }

  if (duzenle) {
    return (
      <tr className="border-b border-cizgi bg-kart">
        <td colSpan={5} className="px-4 py-3">
          <form action={guncelleEylem} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="id" value={musteri.id} />
            <input
              name="unvan"
              required
              defaultValue={musteri.unvan}
              placeholder="Unvan *"
              className={girdiSinif}
            />
            <input
              name="vkn"
              defaultValue={musteri.vkn ?? ""}
              placeholder="VKN"
              className={girdiSinif}
            />
            <input
              name="eposta"
              type="email"
              defaultValue={musteri.eposta ?? ""}
              placeholder="E-posta"
              className={girdiSinif}
            />
            <input
              name="telefon"
              defaultValue={musteri.telefon ?? ""}
              placeholder="Telefon"
              className={girdiSinif}
            />
            <button
              type="submit"
              disabled={guncelleniyor}
              className="rounded-md bg-murekkep px-3 py-1.5 text-sm font-medium text-kagit hover:bg-[#123a33] disabled:opacity-50"
            >
              {guncelleniyor ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setDuzenle(false)}
              className="px-2 py-1.5 text-sm text-murekkep-2 hover:text-murekkep"
            >
              Vazgeç
            </button>
            {guncelleDurum.hata && (
              <span className="text-sm text-gecikme">{guncelleDurum.hata}</span>
            )}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-cizgi">
      <td className="px-4 py-3 font-medium text-murekkep">{musteri.unvan}</td>
      <td className="px-4 py-3 text-murekkep-2">{musteri.vkn ?? "—"}</td>
      <td className="px-4 py-3 text-murekkep-2">{musteri.eposta ?? "—"}</td>
      <td className="px-4 py-3 text-murekkep-2">{musteri.telefon ?? "—"}</td>
      <td className="px-4 py-3 text-right">
        {silOnay ? (
          <form action={silEylem} className="inline-flex items-center gap-2">
            <input type="hidden" name="id" value={musteri.id} />
            <span className="text-xs text-murekkep-2">Emin misiniz?</span>
            <button
              type="submit"
              disabled={siliniyor}
              className="text-sm font-medium text-gecikme hover:underline disabled:opacity-50"
            >
              {siliniyor ? "Siliniyor…" : "Evet, sil"}
            </button>
            <button
              type="button"
              onClick={() => setSilOnay(false)}
              className="text-sm text-murekkep-2 hover:text-murekkep"
            >
              Vazgeç
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setDuzenle(true)}
              className="text-sm text-murekkep-2 hover:text-murekkep hover:underline"
            >
              Düzenle
            </button>
            <button
              type="button"
              onClick={() => setSilOnay(true)}
              className="text-sm text-gecikme hover:underline"
            >
              Sil
            </button>
          </div>
        )}
        {silDurum.hata && (
          <p className="mt-1 text-xs text-gecikme">{silDurum.hata}</p>
        )}
      </td>
    </tr>
  );
}
