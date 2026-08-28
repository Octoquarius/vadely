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
          ← Payments
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
          Upload bank statement
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload your account transactions; we&apos;ll help you import incoming
          payments and match them with your open invoices.
        </p>
      </div>
      <EkstreForm />
    </div>
  );
}
