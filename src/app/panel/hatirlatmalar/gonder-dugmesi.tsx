"use client";

import { useActionState } from "react";
import { bekleyenleriGonder, type IslemDurum } from "./actions";

const baslangic: IslemDurum = {};

export function BekleyenleriGonderDugmesi() {
  const [durum, eylem, bekliyor] = useActionState(
    bekleyenleriGonder,
    baslangic
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={eylem}>
        <button
          type="submit"
          disabled={bekliyor}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {bekliyor ? "Sending…" : "✉ Send pending"}
        </button>
      </form>
      {durum.mesaj && (
        <span className="text-sm text-green-700">{durum.mesaj}</span>
      )}
      {durum.hata && <span className="text-sm text-red-600">{durum.hata}</span>}
    </div>
  );
}
