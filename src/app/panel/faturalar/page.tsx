import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FaturaForm } from "./fatura-form";
import { FaturaSatiri } from "./fatura-satiri";

export default async function FaturalarSayfasi() {
  const supabase = await createClient();

  const [{ data: faturalar }, { data: musteriler }] = await Promise.all([
    supabase
      .from("faturalar")
      .select(
        "id, fatura_no, fatura_tarihi, vade_tarihi, tutar, kalan_bakiye, durum, musteriler ( unvan )"
      )
      .order("vade_tarihi", { ascending: true }),
    supabase.from("musteriler").select("id, unvan").order("unvan"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Invoices</h1>
        <Link
          href="/panel/faturalar/ice-aktar"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          ⬆ Import invoices (XML/CSV)
        </Link>
      </div>

      <FaturaForm musteriler={musteriler ?? []} />

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice no</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Due date</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Remaining</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(faturalar ?? []).map((fatura) => (
              <FaturaSatiri
                key={fatura.id}
                fatura={{
                  id: fatura.id,
                  fatura_no: fatura.fatura_no,
                  fatura_tarihi: fatura.fatura_tarihi,
                  vade_tarihi: fatura.vade_tarihi,
                  tutar: Number(fatura.tutar),
                  kalan_bakiye: Number(fatura.kalan_bakiye),
                  durum: fatura.durum,
                  musteri_unvan:
                    (fatura.musteriler as unknown as { unvan: string } | null)
                      ?.unvan ?? "—",
                }}
              />
            ))}
            {(faturalar ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
