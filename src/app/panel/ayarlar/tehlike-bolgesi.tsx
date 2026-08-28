"use client";

import { useActionState, useState } from "react";
import { hesapSil, type IslemDurum } from "./actions";

const baslangic: IslemDurum = {};

export function TehlikeBolgesi({ sahipMi }: { sahipMi: boolean }) {
  const [onayMetni, setOnayMetni] = useState("");
  const [durum, eylem, bekliyor] = useActionState(hesapSil, baslangic);

  return (
    <div className="rounded-xl border border-red-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <p className="text-sm font-medium text-zinc-900">Download my data</p>
          <p className="text-sm text-zinc-500">
            A JSON copy of all your account data (your KVKK right of access —
            Turkey's data protection law equivalent to GDPR).
          </p>
        </div>
        <a
          href="/api/veri-indir"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Download
        </a>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-zinc-900">Permanently delete account</p>
        <p className="text-sm text-zinc-500">
          All customers, invoices, payments, reminders, and users are
          deleted irreversibly. Download your data first.
        </p>
        {sahipMi ? (
          <form action={eylem} className="mt-3 flex flex-wrap items-center gap-3">
            <input
              name="onay"
              value={onayMetni}
              onChange={(e) => setOnayMetni(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={onayMetni !== "DELETE" || bekliyor}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40"
            >
              {bekliyor ? "Deleting…" : "Permanently delete account"}
            </button>
            {durum.hata && (
              <span className="text-sm text-red-600">{durum.hata}</span>
            )}
          </form>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">
            Only the account owner can delete the account.
          </p>
        )}
      </div>
    </div>
  );
}
