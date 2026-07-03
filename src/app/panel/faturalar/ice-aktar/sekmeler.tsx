"use client";

import { useState } from "react";
import { IceAktarSihirbazi } from "./ice-aktar-form";
import { XmlIceAktar } from "./xml-ice-aktar";

const SEKMELER = [
  { anahtar: "xml", etiket: "e-Fatura XML (UBL)" },
  { anahtar: "csv", etiket: "CSV / Excel dökümü" },
] as const;

type SekmeAnahtari = (typeof SEKMELER)[number]["anahtar"];

export function IceAktarSekmeleri() {
  const [sekme, setSekme] = useState<SekmeAnahtari>("xml");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1">
        {SEKMELER.map((s) => (
          <button
            key={s.anahtar}
            onClick={() => setSekme(s.anahtar)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              sekme === s.anahtar
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {s.etiket}
          </button>
        ))}
      </div>
      {sekme === "xml" ? <XmlIceAktar /> : <IceAktarSihirbazi />}
    </div>
  );
}
