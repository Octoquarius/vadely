import { createClient } from "@/lib/supabase/server";
import { musteriSil } from "../actions";
import { MusteriForm } from "./musteri-form";

export default async function MusterilerSayfasi() {
  const supabase = await createClient();

  const { data: musteriler } = await supabase
    .from("musteriler")
    .select("id, unvan, vkn, eposta, telefon, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Müşteriler</h1>

      <MusteriForm />

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Unvan</th>
              <th className="px-4 py-3 font-medium">VKN</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(musteriler ?? []).map((musteri) => (
              <tr key={musteri.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {musteri.unvan}
                </td>
                <td className="px-4 py-3 text-zinc-600">{musteri.vkn ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {musteri.eposta ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {musteri.telefon ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={musteriSil}>
                    <input type="hidden" name="id" value={musteri.id} />
                    <button
                      type="submit"
                      className="text-sm text-red-600 hover:underline"
                    >
                      Sil
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {(musteriler ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Henüz müşteri yok. Yukarıdaki formdan ilk müşterinizi ekleyin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
