import Link from "next/link";
import { IceAktarSihirbazi } from "./ice-aktar-form";

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
          CSV ile fatura içe aktar
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ön muhasebe programınızdan veya e-fatura portalınızdan aldığınız CSV
          dökümünü yükleyin; müşterileri otomatik oluşturur, mükerrer
          faturaları atlarız.
        </p>
      </div>
      <IceAktarSihirbazi />
    </div>
  );
}
