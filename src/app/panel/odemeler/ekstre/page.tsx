import Link from "next/link";
import { EkstreForm } from "./ekstre-form";

export default function EkstreSayfasi() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/panel/odemeler"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Ödemeler
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
          Banka ekstresi yükle
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Hesap hareketlerinizi yükleyin; gelen ödemeleri içeri alıp açık
          faturalarınızla eşleştirmenize yardımcı olalım.
        </p>
      </div>
      <EkstreForm />
    </div>
  );
}
