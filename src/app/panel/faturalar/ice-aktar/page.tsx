import Link from "next/link";
import { IceAktarSekmeleri } from "./sekmeler";

export default function IceAktarSayfasi() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/panel/faturalar"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Faturalar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
          Fatura içe aktar
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          e-Fatura/e-Arşiv XML dosyalarınızı veya ön muhasebe programınızdan
          aldığınız CSV dökümünü yükleyin; müşterileri otomatik oluşturur,
          mükerrer faturaları atlarız.
        </p>
      </div>
      <IceAktarSekmeleri />
    </div>
  );
}
