<div align="center">

<!-- Replace with your actual logo once ready -->
<!-- <img src=".github/assets/logo.png" alt="Vetalist Logo" width="120" /> -->

# 🐾 Vetalist

**A production-ready veterinary booking platform for the French market.**
**Built end-to-end by one developer. AI-collaborated. Security-audited.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br/>

[![Status](https://img.shields.io/badge/Status-Production_Ready-22c55e?style=for-the-badge&logoColor=white)]()
[![Auth](https://img.shields.io/badge/Auth-NextAuth_v5-7c3aed?style=for-the-badge&logoColor=white)]()
[![Security](https://img.shields.io/badge/Security-AI_Audited-ef4444?style=for-the-badge&logoColor=white)]()
[![Language](https://img.shields.io/badge/Market-France_🇫🇷-0055A4?style=for-the-badge)]()

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-AmrChatelain-181717?style=flat-square&logo=github)](https://github.com/AmrChatelain) · [![LinkedIn](https://img.shields.io/badge/LinkedIn-Amr_Chatelain-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/amr-chatelain-webdeveloper/?locale=fr)

</div>

<br/>

---

## 📖 Table of Contents

- [The Story](#-the-story)
- [Screenshots](#-screenshots)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Architecture Decisions](#️-architecture-decisions-worth-knowing)
- [Security Audit](#-security--ai-audited-before-launch)
- [Features](#-full-feature-list)
- [Local Setup](#-local-setup)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [The Takeaway](#-the-takeaway)

---

## 🧠 The Story

> **What if one developer, armed with AI, could build what a team of 4 used to take months to ship?**

Vetalist started as a real business idea for the French market — a Doctolib-style platform, but purpose-built for veterinarians. Clients find, compare, and book vets in seconds. Vets manage their full schedule, profile, and patient flow from a single dashboard. Admins control which vets are approved and live.

The business didn't launch — vets in France preferred a human sales pitch over a SaaS onboarding flow. But the codebase tells a more interesting story:

**This is what a solo developer can ship when they treat AI as a genuine technical partner — not a code generator, but an architect, a reviewer, and an adversarial security auditor.**

Every major feature was designed in conversation with AI. Every security vulnerability in this README was caught by a structured AI-powered audit run before the first deployment. The code is clean, the patterns are consistent, and the security posture is production-grade.

---

## 📸 Screenshots

> *Screenshots coming soon — add yours in `.github/assets/` and update these paths.*

<div align="center">

| Homepage |
|----------|
| ![Homepage](.github/public/assets/homepage.png)|


</div>

---

## ⚙️ How It Works

Vetalist has **three distinct user roles**, each with their own onboarding, dashboard, and permissions.

```
┌─────────────────────────────────────────────────────────────────┐
│                        VETALIST PLATFORM                        │
├───────────────┬──────────────────────┬──────────────────────────┤
│    CLIENT     │    VETERINARIAN      │        ADMIN             │
├───────────────┼──────────────────────┼──────────────────────────┤
│               │                      │                          │
│  Register     │  Register            │  Approve / Reject vets   │
│  Search vets  │  4-step onboarding   │  Toggle trusted badge    │
│  Book (5-step)│  Pending approval    │  Manage all users        │
│  Manage pets  │  Dashboard + stats   │                          │
│  View history │  Confirm / Cancel    │                          │
│  Email alerts │  Working hours       │                          │
│               │  Photo upload        │                          │
│               │  Print QR flyer      │                          │
└───────────────┴──────────────────────┴──────────────────────────┘
```

### Booking Flow

```
Client searches → Views vet profile → Clicks Book
    → Step 1: Select date
    → Step 2: Select time slot (live availability API)
    → Step 3: Select or create pet
    → Step 4: Enter reason (XSS sanitized)
    → Step 5: Confirm
         │
         ├── DB: appointment created (race condition guarded)
         ├── Email: vet notified immediately
         └── Cron: client reminded at 24h + 1h before
```

### Vet Approval Flow

```
Vet registers → 4-step onboarding → status: PENDING_APPROVAL
    → Admin reviews → Approve or Reject (with sanitized reason)
    → Email sent to vet in both cases
    → If approved: status: ACTIVE → appears in search
    → If rejected: vet sees reason + can resubmit
```

---

## 🛠 Tech Stack

<div align="center">

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 15.1 — App Router | Server components, streaming, server actions |
| **Language** | TypeScript | Type safety across the full stack |
| **Auth** | NextAuth v5 — Google OAuth + Credentials | Edge-safe, JWT strategy, role-based |
| **Database** | PostgreSQL via Supabase | Relational, ACID, hosted |
| **ORM** | Prisma 5.22 | Type-safe queries, migrations |
| **Styling** | Tailwind CSS + shadcn/ui | Speed + consistency |
| **Email** | Resend + custom templates | 8 French transactional templates |
| **Storage** | Supabase Storage | Vet profile photos |
| **Rate Limiting** | Upstash Redis | 3 attack vectors covered |
| **Cron** | Vercel Cron (every 30 min) | Appointment reminders |
| **Hosting** | Vercel | Zero-config Next.js deployment |
| **Forms** | react-hook-form + zod | Validation client + server |
| **QR Codes** | qrcode.react | Printable clinic flyers |

</div>

---

## 🏛️ Architecture Decisions Worth Knowing

These aren't obvious from reading the code. They represent real problems that surfaced during development and were solved deliberately.

<details>
<summary><strong>1. Edge-safe auth split — `auth.config.ts` vs `auth.ts`</strong></summary>

<br/>

Next.js middleware runs on the Edge runtime. Prisma does not support the Edge. So the auth config is split into two files:

- `auth.config.ts` — edge-safe, no Prisma, used exclusively by middleware for route protection
- `auth.ts` — full Node.js runtime, Prisma access, used by all server components and actions

This is the correct pattern for Next.js 15 + NextAuth v5. Getting it wrong means your middleware crashes silently.

</details>

<details>
<summary><strong>2. Booking race condition — two layers of protection</strong></summary>

<br/>

The naive approach: check if a slot is free, then insert. The problem: two simultaneous requests both pass the check, then both try to insert. Result: double booking.

**Layer 1 — DB constraint:** `@@unique([vetId, startTime])` in the Prisma schema. The database enforces uniqueness at the lowest level.

**Layer 2 — Proper error handling:** `db.appointment.create` is wrapped in a try/catch. If the unique constraint fires (Prisma error `P2002`), the client receives a clean `409 Conflict` with a French error message instead of a `500 Internal Server Error`.

</details>

<details>
<summary><strong>3. Google OAuth role — why cookies were wrong</strong></summary>

<br/>

During Google OAuth, the user selects a role (client or vet) before being redirected to Google. The first implementation stored this role in a cookie, then read it back after the OAuth callback.

**The exploit:** a user could modify the cookie client-side between the role selection and the callback — registering as any role they wanted, including admin.

**The fix:** the role is stored in **Upstash Redis server-side**, keyed to a short-lived token passed through the OAuth state parameter. The callback reads from Redis, never from a client-controlled cookie.

</details>

<details>
<summary><strong>4. JWT sync strategy — not every request</strong></summary>

<br/>

The JWT is synced from the database only on `trigger === "signIn"` or `"update"` — not on every request. This means no DB hit on every page load. Role changes and vet status updates are reflected the next time the user signs in or triggers an explicit session update.

</details>

<details>
<summary><strong>5. `getNextSlotsForVets` — from 4×N queries to 4 total</strong></summary>

<br/>

The original implementation called `getNextAvailableSlot(vetId)` for each vet individually. Each call fired 4 DB queries (working hours, blocks, appointments, profile). With 50 vets on a search page that's 200 queries per page load.

The fix: one batch query per data type using `{ in: vetProfileIds }`, then group results in memory and run the pure slot-finding logic per vet with zero additional DB calls. Always 4 queries regardless of how many vets are on the page.

</details>

<details>
<summary><strong>6. `vetStatus` on `VetProfile`, not `User`</strong></summary>

<br/>

It would be simpler to put a `status` field on the `User` model. But a user can only be a vet if they have a `VetProfile`. Putting status there keeps the data model clean and forces every status check to go through the correct join, preventing a class of bugs where status is checked on the wrong model.

</details>

---

## 🔐 Security — AI-Audited Before Launch

Every feature was shipped, then the full codebase was handed to a local AI for an adversarial security review. Issues were triaged by severity and all critical findings were fixed before the first deployment.

<div align="center">

| Vulnerability | Severity | Status | Fix |
|--------------|----------|--------|-----|
| Timing attack on `CRON_SECRET` | 🔴 Critical | ✅ Fixed | `crypto.timingSafeEqual` instead of string comparison |
| Race condition on slot booking | 🔴 Critical | ✅ Fixed | `@@unique` constraint + P2002 catch → 409 |
| XSS in vet rejection reason email | 🔴 Critical | ✅ Fixed | `sanitizeText()` before DB write + email send |
| XSS in booking reason field | 🔴 Critical | ✅ Fixed | `sanitizeText()` in appointments API |
| Google OAuth role via client cookie | 🔴 Critical | ✅ Fixed | Server-side Redis token validation |
| Unprotected `api/vets` POST endpoint | 🟡 Important | ✅ Fixed | Dead route deleted entirely |
| N+1 in `getVetDashboardData` | 🟡 Important | ✅ Fixed | Date filter + `take: 500` |
| N+1 in `getClientDashboardData` | 🟡 Important | ✅ Fixed | 90-day filter + `take: 200` |
| N+1 in `getNextSlotsForVets` (4×N DB calls) | 🟢 Scale | ✅ Fixed | Batched to 4 queries total |
| Password reset token exposed in URL | 🟡 Important | ✅ Fixed | Token cleared from URL immediately after validation |

</div>

> The audit didn't just catch bugs — it shaped the security posture of the entire platform. This is what AI-assisted development looks like when used seriously.

---

## ✅ Full Feature List

<details>
<summary><strong>🔐 Auth & Security</strong></summary>

- [x] Email/password registration — bcrypt cost 12
- [x] Google OAuth with role selection (server-side Redis token)
- [x] Password rules enforced client + server (min 8, max 72, 1 letter, 1 number)
- [x] Token-based password reset — 15-min expiry, single use
- [x] Rate limiting on bookings (10/min), search suggestions (30/min), password reset (5/15min)
- [x] XSS sanitization on all user inputs that reach email templates
- [x] Middleware-level route protection with role-based routing
- [x] GDPR-compliant cookie banner

</details>

<details>
<summary><strong>📅 Booking Engine</strong></summary>

- [x] 5-step booking wizard at `/book/[vetId]` — shareable URL, mobile-friendly
- [x] Real-time slot availability API: `GET /api/availability/[vetId]/slots?date=YYYY-MM-DD`
- [x] Race condition guard — DB constraint + P2002 catch → clean 409
- [x] Emergency booking flag
- [x] Inline pet creation during booking
- [x] Pet data snapshot at booking time — history preserved if pet is updated later

</details>

<details>
<summary><strong>📧 Emails — All French, all fr-FR dates</strong></summary>

- [x] New booking notification → vet
- [x] Appointment confirmation → client (when vet confirms)
- [x] Appointment cancellation → client (vet or client initiated)
- [x] 24h reminder → client (Vercel cron)
- [x] 1h reminder → client (Vercel cron)
- [x] Vet approved → vet
- [x] Vet rejected with sanitized reason → vet
- [x] Password reset link → user

</details>

<details>
<summary><strong>🔍 Search</strong></summary>

- [x] Full-text search by name, city, ZIP code
- [x] Filter by specialty, care type, language, emergency availability
- [x] Multi-select language filter — comma-separated URL params
- [x] French as default — vets with empty `languagesSpoken` treated as French-speaking
- [x] Removable filter chips with per-section clear buttons
- [x] OR filter bug fixed — `where.AND` array, no condition overwriting
- [x] Better empty state with "clear all filters" CTA

</details>

<details>
<summary><strong>🌐 SEO</strong></summary>

- [x] Per-page `metadata` on every route
- [x] `generateMetadata` on dynamic vet profile pages
- [x] `sitemap.ts` — static pages + all active vet profiles
- [x] `robots.ts`
- [x] JSON-LD `Organization` + `WebSite` on homepage
- [x] JSON-LD `VeterinaryCare` on each vet profile (address, hours, booking action)

</details>

<details>
<summary><strong>🏗️ Infrastructure</strong></summary>

- [x] Vercel Cron every 30 min for appointment reminders
- [x] Printable A5 vet flyer with QR code at `/print/[vetId]`
- [x] French dates everywhere — `full-icu` + `cross-env` (Windows dev compatible)
- [x] Mobile sidebars on all 3 dashboards — shadcn Sheet + Radix accessibility
- [x] Animated French 404 and error pages
- [x] `getNextSlotsForVets` — batched to 4 DB queries regardless of vet count

</details>

---

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase free tier works)
- [Resend](https://resend.com) account for emails
- [Upstash Redis](https://upstash.com) database for rate limiting

### 1. Clone and install

```bash
git clone https://github.com/AmrChatelain/vetalist.git
cd vetalist
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
AUTH_SECRET=                          # openssl rand -base64 32
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Email
RESEND_API_KEY=
RESEND_FROM=Vetalist <noreply@yourdomain.fr>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cron (any random string)
CRON_SECRET=
```

### 3. Database setup

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run

```bash
npm run dev
```

> ⚠️ **Important:** This project uses **Webpack**. Do not switch to Turbopack — it causes crashes with the current dependency set.

---

## 📁 Project Structure

```
src/
├── actions/                    # Server actions — no API routes for mutations
│   ├── auth.actions.ts
│   ├── client.actions.ts       # Pet CRUD, appointment cancel, profile, password
│   ├── vet.actions.ts          # Confirm/cancel, toggles, working hours, dashboard
│   ├── admin.actions.ts        # Approve/reject, badge toggle
│   ├── onboarding.actions.ts   # 4-step vet onboarding
│   └── password-reset.ts       # Token-based reset flow
│
├── app/
│   ├── (auth)/                 # Login, register, onboarding, forgot/reset password
│   ├── (public)/               # Search, vet profiles — no login required
│   ├── api/
│   │   ├── appointments/       # POST — race condition guarded, rate limited, XSS sanitized
│   │   ├── availability/       # GET slots by vet + date
│   │   ├── cron/reminders/     # 24h + 1h email reminders
│   │   ├── search/             # Search + suggestions (rate limited)
│   │   └── auth/               # NextAuth handler + OAuth intent
│   ├── book/[vetId]/           # 5-step booking wizard
│   ├── dashboard/
│   │   ├── admin/              # Vet review, badge control, users
│   │   ├── client/             # Warm Garden design, pets, appointments, settings
│   │   └── vet/                # Stats, appointments, profile editor, availability
│   └── print/[vetId]/          # A5 printable flyer with QR code
│
├── components/
│   ├── booking/                # BookingWizard
│   ├── search/                 # SearchBar, SearchFilters, ActiveFiltersBar, VetCard
│   ├── vet/                    # ProfileEditor, AvailabilityManager, PhotoUpload
│   ├── client/                 # Appointments, Pets, Settings
│   └── admin/                  # VetReview, VerifiedControl, UsersTable
│
├── emails/
│   └── templates.ts            # 8 Resend templates — all French
│
└── lib/
    ├── auth.ts + auth.config.ts # Node vs Edge auth split
    ├── db.ts                    # Prisma client exported as `db`
    ├── email.ts                 # sendEmail() wrapper
    ├── ratelimit.ts             # Upstash rate limiters
    ├── get-next-slot.ts         # Slot logic — batched, pure function
    └── validations/             # Zod schemas
```

---

## 🗺️ Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| **Pre-launch** | Legal pages (mentions légales, CGU, confidentialité) | ⏳ Waiting on company info |
| **Pre-launch** | Email verification on signup | ⏳ Post-launch |
| **Phase 2** | Map view on search (Leaflet) | 📋 Planned |
| **Phase 2** | Geocoding — auto lat/lng on address save | 📋 Planned |
| **Phase 2** | City SEO landing pages (`/vets/paris`) | 📋 Planned |
| **Phase 3** | Reviews & ratings system | 💭 Concept |
| **Phase 3** | Stripe subscriptions for vets | 💭 Concept |
| **Phase 3** | Vet analytics dashboard | 💭 Concept |
| **Phase 3** | Push notifications | 💭 Concept |
| **Phase 3** | Arabic language support | 💭 Concept |

---

## 💡 The Takeaway

This project answers a question that matters right now in software development:

**What does "AI-assisted development" actually look like when done seriously?**

Not: paste a prompt, copy the output, ship it.

But: use AI to think through architecture before writing a line. Use it to review your own work adversarially. Use it to catch the security issues that slip through when you're building alone at 2am. Use it to refactor the N+1 you didn't notice because you were focused on the feature.

The result is a codebase that handles:

- Multi-role authentication with edge-safe middleware
- Real-time booking with race condition protection at the DB level
- Automated email workflows with cron scheduling
- Production SEO with structured data on every vet profile
- A security posture that was tested before it ever saw real users

**The AI didn't build this. It made one developer capable of building it properly.**

---

<div align="center">

<br/>

**Built with 🤖 + ☕ — solo, from idea to production.**

<br/>

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/amr-chatelain-webdeveloper/?locale=fr)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AmrChatelain)
[![Portfolio](https://img.shields.io/badge/Portfolio-22c55e?style=for-the-badge&logo=googlechrome&logoColor=white)](https://achatelain.eu/)

<br/>

*If this project was useful or interesting, a ⭐ goes a long way.*

</div>