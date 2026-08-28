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
          ← Invoices
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
          Import invoices
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload your e-Fatura/e-Arşiv XML files or a CSV export from your
          accounting software; we automatically create customers and skip
          duplicate invoices.
        </p>
      </div>
      <IceAktarSekmeleri />
    </div>
  );
}
