# plan.md — AI-Assisted Automated Accounts-Receivable Collection + Cash-Flow Forecasting SaaS (Turkey)

> Working name: **"Collection Assistant"** (ASSUMPTION — the brand name will be decided later).
> All monetary amounts are in **USD** (conversion anchor: 1 USD ≈ 46.7 TL, July 2026).
> Labor/salary costs are **not included** in this plan — early-stage solo-founder / sweat-equity assumption.

---

## 1. Executive Summary

**Vision:** Enable every SME in Turkey to collect its receivables without human
intervention, without damaging the relationship, and predictably.

**One-sentence value proposition:** "Let us chase your invoices; get paid
sooner without straining the relationship with your customer, and see today
what your bank balance will look like 90 days from now."

**For whom:** Turkish SMEs with 5-250 employees that use e-Invoice/e-Archive
and sell on credit terms (B2B) — especially manufacturing, wholesale trade,
services, and agency segments.

**What it solves:** SMEs know how to issue an invoice; they can't
**collect** it systematically. Sending reminders feels awkward, gets
forgotten, and is inconsistent; cash flow is invisible. The product is built
on a **data pipeline** fed by GİB e-Invoice data and bank transactions, and it
delivers an automatic, personalized collection workflow plus a 30/60/90-day
cash forecast.

**Why now:** As of January 1, 2026, paper invoices are completely banned for
taxpayers on the balance-sheet basis, and this rule is **in effect** — every
commercial transaction now flows digitally through GİB (the Turkish Revenue
Administration). Structured invoice data is nearly universal; the raw
material the product needs is already available at every SME.

**Strategic principle:** The core value isn't the AI model; it's the **data
pipeline + workflow**. The AI layer is abstracted and provider-agnostic
(model-agnostic) — no matter how fast the model market changes, the product
doesn't become obsolete.

---

## 2. Problem & Market

### Problem

- Poor cash-flow management plays a role in **~82%** of SME failures.
- The average receivables collection period in Turkish manufacturing reached
  **75 days** in 2024 (CBRT/TCMB).
- Atradius 2025: **~2/3 of B2B invoices** are paid late; bad debt reaches
  **~10%** of B2B sales.
- At an SME, collection tracking is typically kept in the owner's head or in
  a bookkeeper's spreadsheet. There's a fear that sending reminders "damages
  the relationship"; not sending them extends the payment cycle. The result:
  profitable but cash-poor companies.

### Ideal Customer Profile (ICP)

| Attribute | Target |
|---|---|
| Segment | Manufacturing, wholesale/distribution, B2B services, agencies |
| Size | 5-250 employees; 20-500 sales invoices per month |
| Sales model | B2B credit sales (30-120 day terms) |
| Current tools | Basic accounting software like Parasut / Logo / Mikro + Excel |
| Pain level | Open receivables balance 2-3x monthly revenue; DSO 60+ days |
| Decision maker | Company owner or finance lead |

### Market Whitespace

There is **no AI-focused, homegrown autonomous accounts-receivable (AR)
player in Turkey**. Local tools are concentrated on basic accounting/invoicing;
the closest local comparable is Mikro's "Tahsildar" (Collector) module.
Figopara does factoring (purchasing receivables) — not automated dunning or
cash forecasting. Global players (HighRadius, BlackLine, Esker, Bill.com,
Versapay, Tipalti) aren't established in Turkey and lack GİB/local banking
integrations. This finding will be confirmed against primary sources via the
steps in Section 16.

---

## 3. Competitors & Positioning

### Competitive Map

| Player | What it does | How we differ |
|---|---|---|
| Parasut, Logo İşbaşı, Mikro | Basic accounting, invoicing | Focused on **issuing** invoices; collection automation and forecasting are missing or weak. **Not a competitor — a data source and potential channel.** |
| Mikro "Tahsildar" | Basic collection reminders | Locked into the Mikro ecosystem; no AI risk score, cash forecast, or multi-channel personalized dunning. |
| Figopara | Invoice financing / factoring | Buys receivables at a discount; doesn't automate the collection process. Long-term **partnership candidate** (routing risky receivables to financing). |
| HighRadius, BlackLine, Esker, Versapay, Bill.com, Tipalti | Enterprise AR automation (global) | Enterprise pricing, no Turkish localization (GİB, KVKK, TRY, WhatsApp culture); doesn't reach SMEs. |
| Bank/fintech cash-management dashboards | Account overview | Doesn't see the receivables side (invoices + behavior); no workflow. |

### Positioning Thesis: "Complementary, Not a Competitor"

- We're **not replacing** basic accounting tools; we're adding a collection
  and forecasting layer **on top of** the invoice data they produce.
- Message: *"Parasut/Logo/Mikro issues your invoice, we collect your money."*
- This positioning (a) delays competitive reaction, (b) opens the door to
  integration partnerships (Phase 2), (c) reduces sales friction since it
  doesn't require the customer to change their existing habits.
- Defensive moat: as the product matures, the accumulated **payment behavior
  data** (who pays whom, how much, and how late) is the asset that's hardest
  to copy — it creates a network effect.

---

## 4. Product Scope

### MVP (Phase 0 output) — ONLY two things

1. **Automatic collection reminders (dunning):** Rule-based, template-driven
   reminder sequences keyed off the invoice due date. First channel:
   **email** (lowest integration cost), followed immediately by WhatsApp.
2. **Simple DSO dashboard:** Open-receivables aging, DSO trend, list of the
   10 riskiest invoices/customers.

**Deliberately excluded** from the MVP: risk scoring (ML), cash-flow
forecasting, multi-bank support, accounting-software API integrations. Data
entry in the MVP is solved via GİB e-Archive retrieval + a **CSV import
fallback**.

### v1 (Phase 1 — if decision thresholds are met)

- **Risk score:** Rule-based first (delinquency history, amount, industry),
  then ML (see Section 9).
- **30/60/90-day cash-flow forecast:** Open invoices + estimated payment
  dates + bank balance.
- **Multi-channel dunning:** WhatsApp + SMS + email orchestration;
  channel/cadence optimization.
- **One-click payment link:** A virtual POS link embedded in the reminder
  message.
- Automatic payment matching via open banking (recognizing a paid invoice
  without manual entry).

### v2 (Phase 2)

- Two-way API integrations and marketplace listings with basic accounting
  software (Parasut, Logo, Mikro).
- Multi-client dashboard for accountants (an accountant manages 30 clients
  from a single screen).
- Sector-benchmark data ("average DSO in your sector is 68 days, yours is
  82").
- Financing-referral partnership for risky receivables (e.g. Figopara) —
  commission revenue.
- Dispute management (capturing invoice disputes within the workflow).

---

## 5. Phased Roadmap + Decision Thresholds

### Phase 0 — Validation + MVP (0-3 months)

- **15-20 SME interviews** (from the target ICP): validate the collection
  process, whether the "damages the relationship" fear is real, and
  willingness to pay. Coding is kept to a minimum before interviews wrap up.
- **MVP build:** GİB e-Archive/e-Invoice data retrieval (via a private
  integrator, or portal export + CSV fallback) + **1 bank** account
  transaction connection + email dunning + DSO dashboard.
- Early traction with **5-25 paying customers**; a 2-4 week free pilot →
  paid conversion.

### Phase 1 — Product-Market Fit (3-9 months)

- Goals: **50+ paying SMEs**, **>10-day DSO reduction** for customers (proof
  of ROI), **<5% monthly churn**.
- If these thresholds hold: add the **cash-flow forecasting + risk score**
  modules (v1); roll out WhatsApp/SMS channels and the payment link.
- Validate the pricing tiers (Starter/Professional/Business) against actual
  usage.

### Phase 2 — Scale (9-18 months)

- **Integration partnerships** and marketplace channels with basic
  accounting software.
- Systematize the accountant channel (channel commission model).
- Target: **500+ paying SMEs** (~$120K ARR base case).

### ⛔ PIVOT/KILL CRITERION

> **If there aren't 50 paying customers AND measurable DSO improvement within
> the first 9 months, the strategy is reassessed.** Options: (a) change
> segment (e.g. sell only to accountants), (b) narrow to a single feature
> (dunning only), (c) offer the product white-label to basic accounting
> players, (d) shut down. "Let's give it a bit more time" is not a valid
> option in this plan.

---

## 6. Technical Architecture

### Principles

- **Minimize maintenance burden:** Solo founder; managed services over
  self-hosted servers. Boring, proven technology.
- **Modular monolith:** No microservices. Clear module boundaries in a
  single repo; split out later only if scale demands it.
- **AI layer is provider-agnostic:** All LLM/ML calls go through a single
  internal interface (`AiProvider`); model/provider changes via
  configuration.
- **Core value lives in the data pipeline:** Even if the AI module is
  disabled entirely, the product (rule-based dunning + dashboard) keeps
  working.

### System Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                          DATA SOURCES                               │
│  GİB e-Invoice/e-Archive   Bank APIs             CSV Import         │
│  (private integrator)      (open banking)        (fallback)         │
└───────────┬───────────────────┬──────────────────────┬─────────────┘
            ▼                   ▼                      ▼
┌────────────────────────────────────────────────────────────────────┐
│  INGEST LAYER (scheduled jobs + webhook receivers)                  │
│  → raw data archive (stored unmodified)                             │
└───────────────────────────────┬────────────────────────────────────┘
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│  NORMALIZE: deduplication, customer matching, currency,             │
│  invoice ↔ payment matching (reconciliation)                        │
└───────────────────────────────┬────────────────────────────────────┘
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│  CORE DATABASE (PostgreSQL)                                         │
│  Customer · Invoice · Payment · Reminder · RiskScore · CashForecast │
└──────┬──────────────────┬─────────────────────┬────────────────────┘
       ▼                  ▼                     ▼
┌─────────────┐   ┌──────────────────┐   ┌──────────────────────────┐
│ SCORE ENGINE│   │ DUNNING ENGINE   │   │ DASHBOARD / REPORTING    │
│ (v1: rules→ │   │ (rules + cadence;│   │ (DSO, aging, forecast)   │
│  ML; absent │   │  MVP core)       │   │                          │
│  in MVP)    │   └────────┬─────────┘   └──────────────────────────┘
└─────────────┘            ▼
                  ┌──────────────────┐        ┌─────────────────────┐
                  │ MESSAGE LAYER    │───────▶│ PAYMENT LINK (v1)   │
                  │ email/WA/SMS     │        │ virtual POS provider│
                  └────────┬─────────┘        └──────────┬──────────┘
                           ▼                             ▼
                  ┌────────────────────────────────────────────────┐
                  │ FEEDBACK LOOP: opened/clicked/paid events      │
                  │ → score engine + cadence optimization          │
                  └────────────────────────────────────────────────┘

Cross-cutting layer (in front of every module): the AiProvider interface
— the LLM provider (Claude/GPT/local model) changes via configuration.
```

### Data Pipeline Flow (end-to-end loop)

**Invoice ingest → normalize → (v1: score) → dunning → payment → feedback:**
A new invoice lands in the system → it's matched to a customer → a reminder
cadence is scheduled based on due date and (in v1) risk score → the message
is sent → the payment link is clicked, or a payment shows up in a bank
transaction → the invoice closes → the resulting payment behavior feeds back
into the score engine and cadence templates. This closed loop is the
product's defensive moat.

### Proposed Stack (each choice justified in one sentence; all of it is an
ASSUMPTION — swappable for an equivalent)

| Layer | Choice | Rationale (1 sentence) |
|---|---|---|
| App framework | **Next.js (TypeScript, App Router)** | One language/one repo for both the dashboard and the API; huge ecosystem, lowest context-switching cost for a solo founder. |
| Hosting | **Vercel or an equivalent managed platform** | Zero server management; deploy/rollback/preview come built in. |
| Database | **PostgreSQL (managed: Neon/Supabase)** | Industry standard for relational financial data; backup/scaling is a non-issue with a managed service. |
| ORM/migrations | **Drizzle or Prisma** | Makes schema changes versioned and safe. |
| Scheduled jobs / queue | **Platform cron + job queue (e.g. Vercel Queues/Upstash QStash)** | Dunning and ingest are inherently scheduled work; a managed queue gets retry/at-least-once delivery for free. |
| Email | **A transactional email API such as Resend/Postmark** | Deliverability is a specialty — buy it, don't build it. |
| WhatsApp/SMS | **WhatsApp Business API (via a BSP) + a local SMS gateway** | WhatsApp is the de facto B2B communication channel in Turkey; using a BSP simplifies the Meta approval process. |
| Payment link | **iyzico or PayTR (link-based)** | Established virtual POS with support for Turkish cards/installments; the link model reduces integration to a single API call. |
| AI access | **Our own `AiProvider` interface, backed by an AI-Gateway-style multi-provider router** | Model-agnosticism is an explicit requirement of the plan; switching providers should be a single config line. |
| ML (v1 risk score) | **Not a Python microservice; a SQL/TS rule engine first, then simple gradient boosting (separate batch job)** | The score can be produced by a daily batch job; a real-time ML service is unnecessary maintenance burden at this stage. |
| Monitoring | **Sentry + platform logs** | Error visibility is a must from day one; setup takes minutes. |

### The "don't get lost chasing new tech" guarantee

- The AI layer is used in **only** these three places, and all three sit
  behind the interface: (1) personalizing dunning messages, (2) explaining/
  summarizing the risk score, (3) a customer-matching assistant. If the
  model changes, product behavior doesn't.
- The **rule-based fallback** for the scoring and forecasting engines is
  always kept live; an AI provider outage doesn't cause a product outage.
- Raw data is archived unmodified; when a better model appears later, all
  historical data can be rescored.

---

## 7. Integrations

Principle for every integration: **go live with the fallback first, build
the real integration once demand proves it out.**

| Integration | Real integration | Starter fallback | Note |
|---|---|---|---|
| **GİB e-Invoice/e-Archive** | Pulling invoice data not directly from GİB but via a **private integrator** (e.g. Logo/eLogo, Foriba/Sovos, Uyumsoft, İzibiz, etc.) API (ASSUMPTION — integrator API access terms to be verified per Section 16) | Uploading the **XML/UBL or CSV/Excel export** the user gets from their integrator portal; also manual invoice entry | MVP starts with the fallback; formal connections with the first 2-3 integrators happen in Phase 1. |
| **Open banking (account transactions)** | Pulling account transactions via the CBRT/BKM open banking infrastructure (HHS/YÖS) or bank APIs (ASSUMPTION — license/partnership requirement to be verified; partner with a licensed TPP/aggregator if needed) | Uploading a bank statement file (CSV/MT940) | Semi-manual payment matching ("did this payment close this invoice?" confirmation) is acceptable in the MVP. |
| **Payment provider (one-click link)** | iyzico / PayTR link API (v1) | Putting an IBAN + amount + description block in the reminder message | The link makes the dunning message's conversion rate measurable. |
| **Email** | Transactional email API (real integration from the MVP — the cheapest and easiest channel) | — (no fallback needed) | SPF/DKIM/DMARC are set up from day one; deliverability is the product's lifeblood. |
| **WhatsApp** | WhatsApp Business API via a BSP; **pre-approved template messages** | Generating a ready-to-send "copy-paste" message for the user (one-click copy to clipboard + wa.me link) | **WhatsApp-first strategy:** the channel with the highest open rate in Turkey; notification cost is ~$0.0006 per message. |
| **SMS** | A local bulk SMS gateway (İYS-compliant) | Can be deferred while WhatsApp/email are available | ~$0.011 per message; backup channel only for recipients without WhatsApp. |
| **Basic accounting software (Parasut/Logo/Mikro)** | Official API + marketplace partnership (Phase 2) | GİB data already covers the invoice flow; plus CSV | The partnership is more valuable as a sales channel than as an integration. |

**Messaging cost model — pass-through (credits):** Message costs are passed
through to the customer as credits (e.g. monthly credits bundled with the
plan + top-up purchases on overage). The ~$0.0006 WhatsApp and ~$0.011 SMS
unit costs **don't erode** the subscription margin; costs scale with message
volume alongside the customer.

---

## 8. Data Model

Main entities and relationships (PostgreSQL; all multi-tenant via
`tenant_id`):

```
Account (tenant: SME)
 └─< User (role: owner / accountant / read-only)
 └─< Customer (the company the SME is owed money by)
     ├─ fields: name, tax ID, contact channels (email/phone/WA),
     │          preferred channel, communication consents (KVKK/İYS)
     └─< Invoice
         ├─ fields: GİB UUID, number, date, due date, amount, currency,
         │          remaining balance, status (open/partial/closed/disputed), source (GİB/CSV/manual)
         ├─< Payment  (can be n-to-n: one payment can close multiple invoices →
         │           InvoicePaymentMatch join table; source: bank/payment link/manual)
         └─< Reminder
             ├─ fields: channel, template, scheduled/sent time,
             │          status (scheduled/sent/opened/clicked/replied), cost
             └─ linked to: DunningCadence (rule set: due-3d, due date, +7d, +15d...)
Customer ─< RiskScore (v1)
 └─ fields: score (0-100), version, generation time, input summary, explanation
Account ─< CashForecast (v1)
 └─ fields: horizon (30/60/90), date range, expected inflow, confidence band, version
Account ─< BankAccount ─< BankTransaction (matching: links to InvoicePaymentMatch)
Audit/event table: all sends and status changes (immutable log)
```

Design notes:

- **Scores and forecasts are versioned** (which rule/model version produced
  them) — required for retrospective evaluation and model changes.
- The **raw ingest archive** is kept separate (S3/Blob); the core DB only
  holds normalized data.
- Communication consents (KVKK/İYS) are a first-class field on the Customer
  entity; without consent, the dunning engine never sees that channel.

---

## 9. AI/ML Components

Principle: **every AI component has a rule-based "version zero"** and the
product keeps working even if AI is disabled. All LLM calls sit behind the
`AiProvider` interface.

### 9.1 Risk Scoring (v1) — rules → ML

- **Version 0 (rules):** Weighted score: historical average days-late,
  delinquency trend, open-balance-to-historical-revenue ratio, partial-payment
  habits, invoice size. Transparent, explainable, works from day one.
- **Version 1 (ML):** Once enough labeled data accumulates (actual payment
  dates serve as the natural label), gradient boosting (XGBoost/LightGBM-style)
  predicts "probability of payment within X days." Daily batch job; no
  real-time service needed.
- **The LLM's role:** Not to **produce** the score, but to explain it ("This
  customer has averaged 22 days late over the last 6 months; risk is rising
  because...").

### 9.2 Cash-Flow Forecasting (v1)

- **Version 0:** Deterministic: open invoices × (due date + the customer's
  historical average lateness) → expected inflow over 30/60/90 days;
  optimistic/pessimistic band.
- **Version 1:** Probabilistic forecast using a per-customer payment-date
  distribution (survival analysis or quantile regression).
- The forecast is always presented **alongside the bank balance** (forecast +
  current cash = an actionable table).

### 9.3 Dunning Personalization (templates in MVP, LLM in v1)

- **MVP:** Hand-written templates with variables (a 3-4 step cadence graded
  from gentle to firm tone). Turkish commercial-courtesy conventions carry
  the product's "don't damage the relationship" promise — these templates are
  written carefully by the founder.
- **v1:** The LLM adapts the template to the customer's context
  (relationship length, amount, past tone, industry). Every message passes a
  **pre-send rule check** (no legal threats, no intimidation, amount/date
  accuracy against the template). Optional "approve before sending" mode.
- **Feedback loop:** Open/click/paid events measure which tone + channel +
  cadence works; simple A/B testing first, then automated optimization.

### 9.4 Cold-Start Strategy

1. **Day 0:** Rule-based score + deterministic forecast — requires no data,
   works for the very first customer.
2. **Historical backfill during onboarding:** The last 12-24 months of
   invoices and payments are pulled from GİB/CSV → the customer sees a
   meaningful score based on their own historical behavior **within the
   first week**.
3. **Industry priors:** Once enough tenants accumulate, anonymized
   sector averages (e.g. typical delinquency in manufacturing is X days)
   become the prior for new tenants (ASSUMPTION — KVKK-compliant
   anonymization is designed under Section 10).
4. **Threshold for moving to ML:** ~50+ tenants and tens of thousands of
   closed invoices; no ML investment is made before that.

---

## 10. Security & Data Protection (KVKK)

**Privacy & security by design** from day one — for a product handling
financial data, trust is the feature itself.

- **Data minimization:** Only fields necessary for collection (invoice
  header, amount, due date, customer contact info). Invoice line-item detail
  is not pulled/stored unless needed.
- **Encryption:** TLS 1.2+ in transit; disk encryption at rest + application-
  layer (envelope) encryption for sensitive fields (API keys, bank tokens).
- **Access control:** Multi-tenant isolation enforces `tenant_id` on every
  query (also enforced at the DB layer via Postgres RLS); role-based access
  (owner/accountant/read-only); all access is written to an audit log.
- **KVKK (Turkish data-protection law) compliance:** VERBİS registration;
  privacy notice; a data-processing agreement (DPA) with customers as data
  processor; the legal basis for processing customer contact data (legitimate
  interest — commercial debt collection) is documented in writing
  (ASSUMPTION — a KVKK expert's opinion is obtained before launch; the
  one-time consulting cost is listed as an OPTIONAL line item).
- **İYS (Turkey's Message Management System):** Compliance for commercial
  electronic messages; the legal nature of a B2B collection reminder (not a
  marketing message, but a contractual notice) is clarified with a written
  legal opinion (ASSUMPTION).
- **Retention policy:** Data is deleted/anonymized within X days of contract
  end (default 90 days — ASSUMPTION); statutory retention periods (Turkish
  Tax Procedure Law, VUK) are kept separate; customers have a "download my
  data + delete" right from the panel.
- **Operational security:** Secrets live in an environment-variable vault
  (never in the repo); dependency scanning (Dependabot); backups + restore
  testing; a simple incident-response runbook.
- **AI-specific:** Personal data is masked **before** being sent to the LLM
  provider (name/amount stay, personal name/phone can be masked); preference
  for a provider/gateway with a zero-data-retention option.

---

## 11. Business Model & Pricing

### Plans (monthly / annual — annual billing gets you ~2 months free)

| Plan | Monthly | Annual | Includes |
|---|---|---|---|
| **Starter** | $12 | $120 | Automatic reminders (email) + DSO dashboard |
| **Professional** | $24 | $240 | + Multi-channel dunning (WhatsApp/SMS) + payment link |
| **Business** | $48 | $480 | + Risk score + 30/60/90-day cash-flow forecast |

- Messaging is billed separately on a **pass-through credit** model (bundled
  plan credits + overage top-ups) — this protects margin.
- Blended **base-case ARPU is ~$20/month**.
- Annual plans pull cash forward and structurally lower churn; the default
  offer at sale time is annual.

### Revenue Tiers (base case ARPU ~$20/month)

| Paying customers | ARR |
|---|---|
| 5 | $1,200 |
| 10 | $2,400 |
| 25 | $6,000 |
| 50 | $12,000 |
| 100 | $24,000 |
| 250 | $60,000 |
| 500 | $120,000 |
| 1,000 | $240,000 |

**ARPU sensitivity (at 500 customers):** low $13 → $78K; base $20 → $120K;
high $33 → $198K ARR. (The high scenario is reachable via a larger share of
Business-plan customers plus credit revenue.)

### ROI Story (the core of the sales narrative)

- For an SME with $50K/month revenue and a 75-day DSO, **a 10-day drop in
  DSO ≈ ~$16-17K of cash pulled forward, permanently** (10/30 × monthly
  revenue). The $240-480 annual subscription is hundreds of times smaller
  than the cost of that freed-up cash if borrowed (given Turkish commercial
  loan interest rates).
- Message: *"A dinner's worth per month, to skip a year's worth of interest
  on a car."*
- This calculation is shown to the customer on the dashboard, using **their
  own data** ("cash pulled forward for you this month: $X") — the primary
  retention mechanism.

---

## 12. Cost & Unit Economics

> **Labor/salary is excluded** — early-stage solo-founder / sweat-equity
> assumption. All figures below are pure infrastructure + service cost.

### Cost Groups

| Group | Line items | Behavior |
|---|---|---|
| **FIXED** | Cloud/hosting, managed database, monitoring (Sentry), domain, dev tools, email infrastructure base fee | Independent of customer count, predictable |
| **VARIABLE** | AI/LLM API calls, WhatsApp/SMS message cost, integrator API usage fees | Scales with usage; the messaging portion is **passed through to the customer** |
| **OPTIONAL** | Marketing (ads, content, events), one-time legal/KVKK consulting | A deliberate choice; can be turned off |

### Cost by Phase

| Phase | Monthly | Annual | Note |
|---|---|---|---|
| **Early (~50-100 customers)** | ~$200-600 | ~$2,400-7,200 | Excludes marketing |
| **Scale (~500 customers)** | ~$2,200-6,000 | ~$26,000-72,000 | Includes marketing; pure operations only ~$1,100-2,800/mo |

### Unit Economics

- Messaging unit costs: **WhatsApp notification ~$0.0006/message, SMS
  ~$0.011/message** — passed through to the customer via the credit model,
  so margin isn't eroded.
- **Gross margin: ~75-85%** (typical SaaS range; the largest variable line
  is LLM calls, which is kept bounded by limiting template+adaptation to
  once per message).
- **Cash break-even:** In the early phase, **~15-30 paying customers**
  (ARPU $20 × 15-30 ≈ $300-600 ≈ early-phase monthly cost). At scale, with
  marketing included, **~110-300 customers**.
- Currency-risk note: costs are mostly USD, revenue is collected in TRY —
  the price list is indexed to USD (see Section 15).

---

## 13. Go-To-Market / Distribution

**Core principle: PLG (product-led growth) + two levers: the e-invoice hook
and the accountant channel.**

1. **The e-invoice hook (a timing weapon):** The paper-invoice ban is in
   effect; every SME is now issuing digital invoices, mandatorily. Message:
   *"You've already switched to mandatory e-invoicing; that data can now earn
   you money."* Content that links compliance messaging to collection value
   (SEO: "e-invoice collections," "how to lower DSO," "receivables tracking
   software") is produced from day one.
2. **The first 15-20 interviews = the first sales pipeline:** The SMEs with
   the biggest pain from the interviews convert into free pilots; successful
   pilots convert into first paying customers (interview → pilot → reference
   chain).
3. **Free pilot → first paying customers:** 2-4 weeks, with real data, with a
   single success metric written down up front: "at least X invoices were
   collected faster in the pilot / DSO dropped by this much." At the end of
   the pilot, the customer — seeing their own ROI on the dashboard — is
   offered an annual plan.
4. **The accountant channel:** One accountant means 20-50 clients. Give
   accountants multi-client visibility (v2) + a referral commission (e.g.
   20% in year one — ASSUMPTION). In Turkey, an accountant's recommendation
   is the strongest trigger in an SME's software decision.
5. **The self-serve PLG funnel:** Upload a CSV → see aging + a DSO dashboard
   free in 5 minutes (can also be marketed as a "free DSO analysis") →
   upgrade to a paid plan to send reminders. Show the value without a card,
   gate the workflow behind payment.
6. **Phase 2 channels:** Basic-accounting-software marketplaces
   (Parasut/Logo ecosystem), industry associations/organized industrial
   zones, invoice-financing partnerships.

---

## 14. Metrics / KPIs

| Metric | Definition | Target |
|---|---|---|
| **DSO reduction** | Per-customer drop in average collection time vs. baseline | >10 days (Phase 1 threshold) — the product's reason for existing |
| **Collection rate** | Share of invoices closed within X days of a reminder | Continuous improvement per cadence |
| **Activation** | Signup → data connected + first reminder sent within 7 days | >60% (ASSUMPTION) |
| **Monthly churn** | Share of paying customers who cancel | <5% (Phase 1 threshold) |
| **MRR / ARR** | Monthly/annual recurring revenue + credit revenue tracked separately | Per Section 11 tiers |
| **CAC** | Customer acquisition cost, by channel | CAC payback <6 months (ASSUMPTION) |
| **NRR** | Net revenue retention (including plan upgrades + credits) | >100% target (via upgrades to the Business plan) |
| **Message performance** | Open/click/pay-conversion rate, by channel | Continuous testing of the WhatsApp-first strategy |

North Star Metric: **"Total cash pulled forward for customers ($)"** — it
combines both product success and the sales narrative into a single number.

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **GİB/integrator integration effort** heavier than expected | MVP delayed | Go live with a CSV/XML import fallback; run the integrator API in parallel; start with a single integrator. |
| **Open banking access** requires a license/partnership | Payment matching stays manual | Statement-file upload + semi-manual matching is sufficient for the MVP; licensed TPP partnership in Phase 1-2. |
| **KVKK/İYS non-compliance** | Fines + reputational damage | Section 10 design from day one; a one-time legal opinion before launch; written determination that reminders are "contractual notices." |
| **Competitive reaction** (Parasut/Logo/Mikro add a similar module) | Channel + market shrinks | Maintain the "complementary" position; make accumulated payment-behavior data and multi-source compatibility (works with all accounting software) the moat; lock in partnerships early. |
| **Currency risk** (costs in USD, revenue in TRY) | Margin erosion | Price list indexed to USD (updated with the exchange rate even when collected in TRY); annual prepayment creates a currency buffer. |
| **Methodology risk** (dunning doesn't measurably lower DSO) | Value proposition collapses | Disciplined before/after measurement in pilots; cadence A/B tests; the PIVOT/KILL criterion applies if the Phase 1 threshold isn't met. |
| **"Damages the relationship" perception** slows adoption | Low activation | Gentle templates + "approve before sending" mode + messages sent from the SME's own name. |
| **Solo-founder bottleneck** | Everything bottlenecks on one person | Managed services, modular monolith, fallback-first integration order — the whole plan is designed around this constraint. |
| **LLM provider change/price increase** | Variable cost swings | The `AiProvider` abstraction + rule-based fallback; the product works even if AI is disabled. |

---

## 16. Validation Steps (a checklist for the founder — not a claim)

- [ ] **Confirm the "no competitors" thesis:** Search Startups.watch and
  Crunchbase for "accounts receivable," "collections," "dunning," "cash flow
  forecasting" + a Turkey filter; check seed rounds from the last 24 months.
- [ ] **Scan the GİB private-integrator list:** Request API documentation,
  data-access terms, and pricing from 3-5 candidates on GİB's current
  private-integrator list (eLogo, Sovos/Foriba, Uyumsoft, İzibiz, etc.);
  learn the contractual framework for "pulling invoices in/out on behalf of a
  taxpayer" authorization.
- [ ] **Verify the GİB communiqués from the primary source:** Confirm the
  scope of the paper-invoice ban (which taxpayer groups, exceptions) against
  the VUK General Communiqués on gib.gov.tr; cite the communiqué number in
  marketing copy.
- [ ] **Archive the CBRT 75-day figure with its source** (sector
  report/statistics link) — show a primary source in the sales deck.
- [ ] **Clarify the open-banking access model:** Find out whether account-
  information services under the BKM/CBRT framework require a license or a
  licensed partner (a 1-hour call with a fintech lawyer should suffice).
- [ ] **Get a preliminary İYS/KVKK opinion:** A written opinion on whether a
  B2B collection reminder counts as a commercial electronic message.
- [ ] **Try/review Mikro "Tahsildar" and Figopara as products:** See their
  actual feature sets firsthand and update the positioning table.
- [ ] **Complete the 15-20 SME interviews** and test three hypotheses: (1) is
  the "damages the relationship" fear real, (2) is there willingness to pay
  $12-48/month, (3) will they tolerate the effort of connecting data
  (GİB/CSV).

---

## 17. Implementation Order (for Claude Code — MVP task list)

Each task is sized to be completed in a single session; ordered by
dependency.

### Foundation

- [ ] **T1 — Project scaffold:** Next.js (TypeScript) + PostgreSQL connection
  + ORM/migration setup + Sentry; includes an empty scaffold for the
  `AiProvider` interface.
- [ ] **T2 — Auth & multi-tenancy:** Signup/login, Account (tenant) + User
  model, role-based access, tenant isolation on every query (including RLS).
- [ ] **T3 — Core data model:** Migrations + basic CRUD API for the
  Customer, Invoice, Payment, InvoicePaymentMatch, and Reminder tables.

### Data Entry

- [ ] **T4 — CSV/Excel invoice import:** Template file + upload flow + column
  mapping screen + validation/error report; automatic customer creation.
- [ ] **T5 — e-Archive/e-Invoice XML (UBL) import:** Parse XML files
  downloaded from the integrator portal and normalize them into
  Invoice+Customer.
- [ ] **T6 — Payment entry:** Manual payment recording + bank statement (CSV)
  upload + a semi-manual invoice-matching screen ("does this payment close
  this invoice?").

### Dunning Engine (MVP core)

- [ ] **T7 — Cadence rule engine:** Reminder scheduling based on due date
  (due-3d / due date / +7d / +15d), tenant-customizable rules, daily
  scheduled-job (cron) plan generation.
- [ ] **T8 — Email sending:** Transactional email API integration, a
  Turkish gentle-to-firm template set (with variables), recording send +
  open/click webhooks against Reminder status.
- [ ] **T9 — "Approve before sending" mode + send log:** A pending-reminders
  queue, one-click approve/edit/skip, an immutable event log.
- [ ] **T10 — WhatsApp copy-and-send fallback:** Before a fully approved BSP
  integration, offer the user a ready-made message via a wa.me link + copy
  to clipboard.

### Dashboard

- [ ] **T11 — DSO dashboard:** DSO calculation + trend, receivables aging
  table, list of the 10 riskiest invoices/customers.
- [ ] **T12 — "Cash pulled forward" indicator:** An ROI indicator from
  invoices closed earlier thanks to reminders (the North Star metric on the
  dashboard).

### Commercialization

- [ ] **T13 — Plans & subscriptions:** 3 plans (monthly/annual), payment
  provider subscription (iyzico/PayTR — ASSUMPTION), plan-based feature
  gates.
- [ ] **T14 — Onboarding flow:** Signup → upload CSV/XML → first DSO
  dashboard in 5 minutes → cadence setup wizard; activation event tracking
  (analytics).
- [ ] **T15 — KVKK foundations:** Privacy-notice pages, consent fields,
  download/delete-data endpoints, a retention-policy job.
- [ ] **T16 — Launch readiness:** A simple marketing page (with the
  e-invoice-hook message), a demo tenant + sample data, a pilot-application
  form.

> v1 tasks (risk score, cash forecast, WhatsApp BSP, payment link, open
> banking) will be planned as a separate task list **once the Phase 1
> decision thresholds are met** — deliberately not included in the MVP list.
