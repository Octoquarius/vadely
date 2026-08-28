import Link from "next/link";

export const metadata = {
  title: "Privacy Notice (KVKK) — Vadely",
};

// NOTE (to founder): This text is a general template; have it reviewed by a
// lawyer specializing in KVKK before publishing. (plan.md Section 10 and 16)

export default function GizlilikSayfasi() {
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
          Personal Data Protection Notice
        </h1>
        <p>
          This notice has been prepared in order to fulfill the disclosure
          obligation under Law No. 6698 on the Protection of Personal Data
          (&quot;KVKK&quot;, Turkey&apos;s Personal Data Protection Law) with
          respect to personal data processed in connection with the use of
          the Vadely service (the &quot;Service&quot;).
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          1. Data controller
        </h2>
        <p>
          The Service is provided by Vadely (the &quot;Company&quot;). With
          respect to data belonging to the customers of the business
          (subscriber) that has signed up for the Service, the subscriber
          itself is the data controller, while Vadely acts as a{" "}
          <strong>data processor</strong> under KVKK.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          2. Data processed
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Subscriber users:</strong> full name, email address,
            password (encrypted), company name, and usage records.
          </li>
          <li>
            <strong>Subscriber&apos;s customers (accounts):</strong> company
            name, tax identification number, contact details (email, phone),
            and invoice and payment records.
          </li>
        </ul>
        <p>
          In line with the principle of data minimization, data that is not
          necessary for collections tracking — such as invoice line-item
          detail — is not processed.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          3. Purposes of processing and legal basis
        </h2>
        <p>
          Data is processed for the purposes of receivables tracking,
          delivering payment reminders, cash-flow reporting, and providing
          the Service, relying on the legal bases set out in KVKK Article
          5/2(c) (performance of a contract) and Article 5/2(f) (legitimate
          interest — pursuit of a commercial receivable).
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">4. Transfer</h2>
        <p>
          Data may be transferred, under contract, to technical
          infrastructure providers necessary to deliver the Service
          (hosting, database, email delivery). Your data is not shared with
          third parties for advertising purposes.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          5. Retention and deletion
        </h2>
        <p>
          Data is retained for the duration of the subscription. When an
          account is deleted, all tenant data is irreversibly deleted;
          statutory retention obligations (e.g., under the Turkish Tax
          Procedure Law) remain reserved.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">
          6. Your rights under KVKK Article 11
        </h2>
        <p>
          You may exercise your rights to access, correct, and delete your
          data, to object to its processing, and to data portability, using
          the &quot;Download my data&quot; and &quot;Delete account&quot;
          tools within the dashboard, or by contacting us by email.
        </p>

        <p className="text-zinc-400">Last updated: July 2026</p>
      </main>
    </div>
  );
}
