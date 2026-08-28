# Vadely

**Accounts-receivable collection SaaS for Turkish SMEs.** Vadely helps you collect
overdue invoices with automatic, gentle reminders — without damaging the
relationship; it shortens days sales outstanding (DSO) and accelerates your cash.

🌐 Live: **https://vadely.vercel.app**

---

## Table of Contents

- [What is Vadely?](#what-is-vadely)
- [Key features](#key-features)
- [User guide](#user-guide)
- [Plans](#plans)
- [Tech stack](#tech-stack)
- [Local development](#local-development)
- [Architecture notes](#architecture-notes)
- [Deployment (Vercel)](#deployment-vercel)
- [Operations / setup steps](#operations--setup-steps)

---

## What is Vadely?

For small and medium-sized businesses, the biggest enemy of cash flow is
**overdue, uncollected invoices**. The accounting team either never finds time
to send reminders, or is reluctant to "upset the customer." Vadely fills that
gap:

- Imports your invoices in seconds via **e-Invoice/e-Archive XML** or **CSV**.
- Generates an **automatic, staged, and gentle** reminder plan based on the due
  date (pre-reminder → due date → gentle overdue → firm overdue).
- Sends reminders by **email** (and **WhatsApp** on the Professional plan).
- **Matches payments against bank statements**, automatically closing invoice
  balances.
- Measures your collection performance and "cash pulled forward" with the
  **DSO dashboard**.

The core promise: **collection without damaging the relationship.** The tone
of the templates is deliberately non-threatening and solution-oriented.

---

## Key features

| Area | What it does |
| --- | --- |
| **Customers** | Customer record management; email/phone/WhatsApp and channel consent (compliant with Turkish data-protection law, KVKK). |
| **Invoices** | Manual entry, CSV import (Turkish Excel formats: `;` delimiter, `1.234,56`, `dd.mm.yyyy`, Windows-1254), **UBL-TR XML** import for GİB (Turkish Revenue Administration) e-Invoice/e-Archive. |
| **Payments** | Manual payment entry, bank statement import, invoice **matching** (partial-payment support; balance and status update automatically). |
| **Reminder cadence** | Rule engine based on day offsets from the due date; template selection for each step. |
| **Sending** | "Approval" mode (you approve before sending) or "automatic" mode; an immutable **event log**. |
| **Tracking** | Open/click/bounce status from the Resend webhook is recorded against reminders. |
| **DSO dashboard** | Average collection time, aging, and cash-pulled-forward indicator. |
| **Onboarding** | A 4-step setup checklist computed from data status, plus one-click sample data. |
| **Data protection (KVKK)** | Privacy notice, explicit consent at signup (enforced server-side + timestamped), download-my-data (JSON), permanent account deletion. |
| **Admin panel** | Cross-tenant oversight for the platform administrator (accounts, metrics, pilot applications). |

---

## User guide

### 1. Create an account
`/kayit` (sign up) → company name, full name, email, password (at least 8
characters), and consent to the data-protection notice. If you forget your
password, request a reset link via `/sifremi-unuttum` (forgot password).

### 2. Add customers
**Panel → Customers.** Add them one by one, or let customers be created
automatically while importing invoices. Each customer must have **email
consent** (`izin_eposta`) checked — reminders are never sent to a customer
without consent.

### 3. Import invoices
**Panel → Invoices → Import.** Two tabs:
- **CSV:** Upload the file; columns (customer, invoice no, date, due date,
  amount…) are auto-detected from the headers, and you confirm before
  importing.
- **e-Invoice/e-Archive XML:** Upload GİB UBL-TR invoices directly; invoice
  number, date, due date, amount, customer name, and tax ID are read
  automatically.

### 4. Configure the reminder cadence
**Panel → Reminders → Cadence.** E.g. `-3 days` (pre-reminder), `0 days` (due
date), `+7 days` (gentle overdue), `+21 days` (firm overdue). You assign a
template to each step. Clicking **"Generate plan"** schedules the due
reminders for your open invoices.

### 5. Send reminders
**Panel → Reminders.** In "approval" mode, review the pending ones and send
them in bulk or one by one with **Send pending**. WhatsApp uses a
copy-and-send workflow. Everything sent is recorded in the **Log**.

### 6. Process and match payments
**Panel → Payments.** Enter a payment manually or upload a **bank
statement** (duplicate rows are skipped automatically). **Match** the
payment to the relevant invoice — the invoice balance and status
(open/partial/closed) update automatically.

### 7. Monitor performance
**Panel → Overview.** DSO (average collection time), open receivables,
aging, and cash pulled forward thanks to reminders.

### 8. Admin panel (platform administrators only)
If you're an administrator, an **Admin** badge appears in the top-right of
the panel. `/yonetim` shows account/receivables/collection metrics and the
account list across all tenants; `/yonetim/pilot` shows pilot applications.

---

## Plans

14-day trial (everything unlocked). Prices in USD; annual billing gets you
~2 months free.

| Plan | Monthly | Highlights |
| --- | --- | --- |
| **Starter** | $12 | Automatic email reminders, cadence engine, DSO dashboard, CSV/e-Invoice import |
| **Professional** ⭐ | $24 | Starter + WhatsApp, bank statement matching, payment link (coming soon) |
| **Business** | $48 | Professional + risk score (coming soon), 30/60/90-day cash forecast (coming soon), priority support |

---

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions) + **React 19**
- **Supabase** (Postgres + Auth + RLS); `ozel`/`public` schemas, multi-tenancy via `hesap_id`
- **Tailwind CSS 4**
- **Resend** (transactional email + status tracking via webhook)
- **Vercel** (deployment)

---

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
```

Required environment variables (`.env.example`):

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |
| `RESEND_API_KEY` | Email sending (without it, send buttons show a clear error) |
| `MAIL_FROM` | Sender address (e.g. `Vadely <onboarding@resend.dev>`) |
| `RESEND_WEBHOOK_SECRET` | Resend webhook signature verification (open/click tracking) |

Useful commands: `npm run build`, `npm run lint`.

---

## Architecture notes

- **Multi-tenancy:** Every table has a `hesap_id` column; it defaults to
  `ozel.aktif_hesap_id()`, and access is restricted via **RLS**. A tenant can
  only ever see its own data.
- **Payment-invoice matching** is always done through the `odeme_eslestir` /
  `eslesme_kaldir` RPCs (these carry out the balance and status updates).
- **Migrations** are managed directly on Supabase (via the MCP
  `apply_migration` tool); the repo does not keep a separate migrations
  folder.
- **Security:** Webhooks are verified with an svix signature plus a ±5-minute
  replay window; user data in email templates is HTML-escaped before being
  embedded; admin functions are `SECURITY DEFINER` and check authorization
  internally.

---

## Deployment (Vercel)

Production deploys are done via the **CLI**:

```bash
vercel deploy --prod
```

> ⚠️ Running `vercel deploy` without flags only produces a **preview** and does
> not update the live alias. `--prod` is required for production.

---

## Operations / setup steps

A few settings outside the code need to be configured from the Supabase
dashboard:

### Enabling email confirmation
Right now, no confirmation email is sent at signup — the account is
activated immediately. To enable the confirmation flow: **Supabase →
Authentication → Sign In / Providers → Email → "Confirm email" ON.** (The
application code already supports the confirmation flow: the post-signup
"click the confirmation link" message, the `email_not_confirmed` error, and
the `/auth/callback` code exchange are all in place.)

> Note: **do not** use the Supabase CLI's `config push` — it can push CLI
> defaults onto unspecified `[auth]` fields and turn confirmations back off.

### Adding a platform administrator
Access to the admin panel is granted to users listed in the
`public.platform_yoneticileri` table. To add a new administrator (in the
Supabase SQL editor):

```sql
insert into public.platform_yoneticileri (user_id)
select id from auth.users where email = 'example@company.com'
on conflict (user_id) do nothing;
```

### Resend webhook
`opened`/`clicked`/`bounced` events are sent to
`https://vadely.vercel.app/api/webhooks/resend`; signatures are verified
using `RESEND_WEBHOOK_SECRET`.
