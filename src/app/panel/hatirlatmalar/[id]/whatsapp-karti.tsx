"use client";

import { useActionState, useState } from "react";
import { whatsappGonderildiIsaretle, type IslemDurum } from "../actions";

const baslangic: IslemDurum = {};

export function WhatsappKarti({
  hatirlatmaId,
  mesaj,
  waLink,
  planlandi,
}: {
  hatirlatmaId: string;
  mesaj: string;
  waLink: string | null;
  planlandi: boolean;
}) {
  const [kopyalandi, setKopyalandi] = useState(false);
  const [durum, eylem, bekliyor] = useActionState(
    whatsappGonderildiIsaretle,
    baslangic
  );

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(mesaj);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      // If clipboard access is blocked, the text is already visible; the user can select it manually.
    }
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
      <h2 className="text-sm font-semibold text-zinc-900">
        💬 Send via WhatsApp
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        The message is ready: copy it or open it in WhatsApp, send it from
        your own number, then mark it here.
      </p>

      <pre className="mt-3 whitespace-pre-wrap rounded-md border border-zinc-200 bg-white p-3 text-sm text-zinc-800">
        {mesaj}
      </pre>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={kopyala}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          {kopyalandi ? "✓ Copied" : "Copy message"}
        </button>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            Open in WhatsApp
          </a>
        ) : (
          <span className="text-sm text-amber-700">
            No valid phone/WhatsApp number on the customer record.
          </span>
        )}
        {planlandi && (
          <form action={eylem}>
            <input type="hidden" name="id" value={hatirlatmaId} />
            <button
              type="submit"
              disabled={bekliyor}
              className="rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
            >
              {bekliyor ? "…" : "Mark as sent"}
            </button>
          </form>
        )}
      </div>

      {durum.mesaj && (
        <p className="mt-2 text-sm text-green-700">{durum.mesaj}</p>
      )}
      {durum.hata && <p className="mt-2 text-sm text-red-600">{durum.hata}</p>}
    </div>
  );
}
