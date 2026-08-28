import Link from "next/link";

export const metadata = {
  title: "Terms of Use — Vadely",
};

// NOTE (to founder): This text is a general template; have it reviewed by a
// lawyer before publishing. (plan.md Section 10 and 16)

export default function KullanimKosullariSayfasi() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-zinc-900">
            Vadely
          </Link>
          <Link href="/kayit" className="text-sm text-zinc-600 hover:text-zinc-900">
            Sign up
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-6 text-zinc-700">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Terms of Use
        </h1>

        <h2 className="text-lg font-semibold text-zinc-900">1. The Service</h2>
        <p>
          Vadely is a software-as-a-service (SaaS) product that schedules and
          sends payment reminders based on your invoice data, and provides
          visibility into collections and cash flow. The Service is provided
          &quot;as is&quot;; collection outcomes are not guaranteed.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          2. Subscription and billing
        </h2>
        <p>
          Plans are billed monthly or annually; prices are quoted in USD, and
          billing may be charged in TRY equivalent. Messaging (SMS/WhatsApp)
          is billed separately on a pay-as-you-go credit model. The trial
          period is 14 days.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          3. User obligations
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            You are responsible for the accuracy of the invoice and contact
            data you upload, and for your legal authority to process that
            data.
          </li>
          <li>
            Reminder messages are sent on your behalf and at your
            instruction; compliance with applicable regulations (KVKK, the
            İYS/commercial communication rules) is the subscriber&apos;s
            responsibility.
          </li>
          <li>The Service may not be used for unlawful collection pressure.</li>
        </ul>

        <h2 className="text-lg font-semibold text-zinc-900">
          4. Termination and data
        </h2>
        <p>
          You may cancel your subscription at any time. When an account is
          deleted, your data is irreversibly deleted; you may export your
          data via &quot;Download my data&quot; before deletion.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          5. Limitation of liability
        </h2>
        <p>
          Vadely is not liable for indirect damages, reminder errors caused
          by faulty source data, or third-party service outages. Total
          liability is limited to the subscription fees paid in the
          preceding 12 months.
        </p>

        <p className="text-zinc-400">Last updated: July 2026</p>
      </main>
    </div>
  );
}
