import { createClient } from "@/lib/supabase/server";
import { MusteriForm } from "./musteri-form";
import { MusteriSatiri } from "./musteri-satiri";

export default async function MusterilerSayfasi() {
  const supabase = await createClient();

  const { data: musteriler } = await supabase
    .from("musteriler")
    .select("id, unvan, vkn, eposta, telefon, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Customers</h1>

      <MusteriForm />

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Company name</th>
              <th className="px-4 py-3 font-medium">Tax ID</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(musteriler ?? []).map((musteri) => (
              <MusteriSatiri key={musteri.id} musteri={musteri} />
            ))}
            {(musteriler ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No customers yet. Add your first one using the form above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
