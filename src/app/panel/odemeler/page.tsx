import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { odemeSil } from "./actions";
import { OdemeForm } from "./odeme-form";

const KAYNAK_ETIKETLERI: Record<string, string> = {
  banka: "Bank",
  odeme_linki: "Payment link",
  manuel: "Manual",
};

function paraFormat(tutar: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(tutar);
}

export default async function OdemelerSayfasi() {
  const supabase = await createClient();

  const [{ data: odemeler }, { data: musteriler }] = await Promise.all([
    supabase
      .from("odemeler")
      .select(
        "id, tutar, odeme_tarihi, kaynak, aciklama, musteriler ( unvan ), fatura_odeme_eslesmeleri ( tutar )"
      )
      .order("odeme_tarihi", { ascending: false })
      .limit(200),
    supabase.from("musteriler").select("id, unvan").order("unvan"),
  ]);

  const satirlar = (odemeler ?? []).map((odeme) => {
    const eslesmis = (
      (odeme.fatura_odeme_eslesmeleri as { tutar: number }[] | null) ?? []
    ).reduce((toplam, eslesme) => toplam + Number(eslesme.tutar), 0);
    return {
      ...odeme,
      eslesmis,
      kalan: Number(odeme.tutar) - eslesmis,
    };
  });

  const eslesmemisToplam = satirlar.reduce(
    (toplam, satir) => toplam + satir.kalan,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Payments</h1>
        <Link
          href="/panel/odemeler/ekstre"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          ⬆ Upload bank statement
        </Link>
      </div>

      {eslesmemisToplam > 0 && (
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have <strong>{paraFormat(eslesmemisToplam)}</strong>{" "}
          in payments not yet matched to invoices. Use &quot;Match&quot; to close the related invoices.
        </p>
      )}

      <OdemeForm musteriler={musteriler ?? []} />

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Unmatched</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {satirlar.map((odeme) => (
              <tr key={odeme.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 text-zinc-600">
                  {new Date(odeme.odeme_tarihi).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {(odeme.musteriler as unknown as { unvan: string } | null)
                    ?.unvan ?? "—"}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {paraFormat(Number(odeme.tutar))}
                </td>
                <td className="px-4 py-3">
                  {odeme.kalan > 0 ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {paraFormat(odeme.kalan)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      Fully matched
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {KAYNAK_ETIKETLERI[odeme.kaynak] ?? odeme.kaynak}
                </td>
                <td className="max-w-48 truncate px-4 py-3 text-zinc-500">
                  {odeme.aciklama ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/panel/odemeler/${odeme.id}`}
                      className="text-sm font-medium text-zinc-900 underline"
                    >
                      {odeme.kalan > 0 ? "Match" : "Details"}
                    </Link>
                    {odeme.eslesmis === 0 && (
                      <form action={odemeSil}>
                        <input type="hidden" name="id" value={odeme.id} />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {satirlar.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No payments yet. Add one using the form or upload a bank statement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
