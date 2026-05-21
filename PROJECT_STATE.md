# Vetalist - Project State (Last Updated: 2026-05-17)

## 🎯 Business Decisions
- **Launch Market:** France → French is PRIMARY language for all UI labels, dates, times
- **English Localization:** Planned as Phase 2 after launch and user acquisition
- **Strategy:** Ship fast, fix/refine after launch. Architectural perfection ≠ broken functionality.
- **Booking Flow:** Standalone page `/book/[vetId]` (not modal) — shareable URL, mobile-friendly, simpler auth guard
- **Pre-launch Strategy:** Target 10 vets in Île-de-France first via personal email outreach, then launch to clients

---

## 📊 Current Status (Ready to Launch)

### ✅ COMPLETE FEATURES
1. **Auth System** - Google OAuth + Credentials via NextAuth v5
2. **Status-Aware JWT & Middleware** - Role/status-based routing ("The Bouncer")
3. **Vet Onboarding Wizard** - Multi-step form → PENDING_APPROVAL status
4. **Vet Dashboard** - Stats, appointments, profile editor, settings, availability
5. **Admin Dashboard** - Vet review/approve/reject, user management, trusted badges
6. **Public Search Flow** - Vet cards + vet detail page (no login required) ✅
7. **Email System** - Resend templates: all French, all templates complete ✅
8. **Cron Reminders** - Vercel cron every 30 min → sends 24h and 1h reminders
9. **Server Actions** - All operations covered (auth, onboarding, vet, admin, password-reset, client)
10. **Prisma Schema** - All models complete + @@unique([vetId, startTime]) ✅
11. **Error Pages** - `error.tsx` and `not-found.tsx` — French, animated ✅
12. **Booking Engine** - `/book/[vetId]` full 5-step wizard ✅
13. **Availability Slots API** - `GET /api/availability/[vetId]/slots?date=YYYY-MM-DD` ✅
14. **Appointments API** - `POST /api/appointments` with race condition guard + rate limiting + vet email notification ✅
15. **Client Dashboard** - Overview, appointments, pets, settings ✅
16. **Client Actions** - Full CRUD for pets, appointments, profile ✅
17. **NavLink Component** - Shared active state for all dashboards ✅
18. **Vet Layout** - French labels, NavLink, mobile hamburger ✅
19. **Admin Layout** - Fixed nav items (admin routes), French labels, mobile hamburger ✅
20. **Client Layout** - Violet accent, French, mobile hamburger ✅
21. **French Dates** - `full-icu` + `cross-env` (Windows compatible) ✅
22. **Image Domains** - All 4 hosts configured in next.config.js ✅
23. **Middleware** - `/book` protected, search open to all, `/print` public ✅
24. **Race Condition** - `@@unique([vetId, startTime])` + migration done ✅
25. **Mobile Sidebars** - All 3 dashboards have Sheet hamburger menu ✅
26. **SEO** - metadata on all pages, generateMetadata on vet profiles, sitemap.ts, robots.ts ✅
27. **Cookie Banner** - GDPR compliant, "Tout accepter" + "Essentiels uniquement" ✅
28. **Print Flyer** - `/print/[vetId]` — A5 printable page with QR code ✅
29. **Login page** - Fully French ✅
30. **Register page** - Fully French ✅
31. **Auth layout fix** - All "use client" auth pages moved metadata to layout.tsx files ✅
32. **Rate Limiting** - Upstash Redis on suggestions, appointments, password reset ✅
33. **Code Consistency** - db + sendEmail used everywhere ✅
34. **Type Safety** - Removed `(vet as any).acceptsEmergencies` cast ✅
35. **Security Fix 1** - `pending_role` cookie → server-side Redis token validation ✅
36. **Security Fix 2** - Password reset token cleared from URL immediately after validation ✅
37. **Security Fix 3** - XSS sanitization on vet rejection reason before email ✅
38. **Vet Booking Email** - Vet notified by email when client books (NEW_BOOKING enum) ✅
39. **Admin Review French** - All English labels translated in AdminVetReview ✅

---

### ❌ NOT YET BUILT

#### 🔴 Legal (Required Before Launch in France)
- [ ] Mentions Légales — `/legal/mentions-legales`
- [ ] Politique de Confidentialité — `/legal/confidentialite`
- [ ] CGU — `/legal/cgu`
- **Waiting on:** company name, SIRET, legal address, legal contact email
- **Plan:** build once 10 vets are onboarded and company info is ready

#### 🟡 Post-Launch — Phase 2
- [ ] Map view on search results (Leaflet, free, no API key)
- [ ] Geocoding — auto lat/lng when vet saves address
- [ ] JSON-LD structured data — Organization + VeterinaryCare schema for SEO

#### 🔵 Phase 3 — After Launch
- [ ] Reviews/ratings system
- [ ] Client report system
- [ ] Re-verification flow
- [ ] Stripe subscriptions for vets
- [ ] Vet analytics dashboard
- [ ] Arabic language support
- [ ] Push notifications
- [ ] Admin bulk email / newsletter
- [ ] PDF appointment reports

---

## ⚠️ Known Issues / Technical Debt

### 🟡 Fix After Launch
1. **`getVetDashboardData`** loads ALL appointments into memory then filters → N+1 at scale
2. **Inline `<style>` tags** in dashboard layouts → should use Tailwind consistently
3. **JSON-LD structured data** missing — Organization + VeterinaryCare schema for SEO

### ✅ Fixed This Session
- ~~Race condition~~ → `@@unique([vetId, startTime])` + migration ✅
- ~~Mobile sidebars missing~~ → all 3 dashboards have hamburger ✅
- ~~SEO missing~~ → metadata + sitemap + robots ✅
- ~~English labels in dashboards~~ → all French ✅
- ~~Active nav state~~ → NavLink component ✅
- ~~`en-GB` locale~~ → `fr-FR` ✅
- ~~Search blocked unauthenticated~~ → middleware fixed ✅
- ~~`/book/[vetId]` unprotected~~ → middleware fixed ✅
- ~~Login/Register page English~~ → fully French ✅
- ~~metadata on "use client" pages~~ → moved to layout.tsx files ✅
- ~~Cookie banner missing~~ → GDPR compliant banner ✅
- ~~Print flyer missing~~ → `/print/[vetId]` with QR code ✅
- ~~Admin layout had wrong nav items~~ → fixed to admin routes ✅
- ~~No rate limiting~~ → Upstash Redis on 3 attack vectors ✅
- ~~`prisma` import inconsistency~~ → uses `db` consistently everywhere ✅
- ~~`resend.emails.send()` inconsistency~~ → uses `sendEmail()` everywhere ✅
- ~~`(vet as any).acceptsEmergencies`~~ → type cast removed ✅
- ~~`pending_role` cookie exploitable~~ → server-side Redis token ✅
- ~~Password reset token in browser history~~ → cleared from URL immediately ✅
- ~~XSS in rejection reason~~ → sanitizeText() applied before email ✅
- ~~No vet email on new booking~~ → newBookingEmail + NEW_BOOKING enum ✅
- ~~AdminVetReview English labels~~ → all French ✅
- ~~VetaList logo typo~~ → Vetalist ✅

---

## 🔧 Technical Notes
- **Framework:** Next.js 15.1.0 (Webpack — NOT Turbopack, crashes)
- **Database:** PostgreSQL via Prisma 5.22.0 (Supabase) — do NOT upgrade to 7.x before launch
- **Styling:** Tailwind CSS + shadcn/ui + inline `<style>` for dashboard layouts
- **Auth:** NextAuth v5 with Google OAuth + Credentials
- **Email:** Resend — `sendEmail()` in `lib/email.ts`, templates in `emails/templates.ts`
- **Cron:** Vercel cron every 30 min
- **ICU/Locale:** `full-icu` + `cross-env` for French dates on Windows dev
- **Rate Limiting:** Upstash Redis (eu-west-1) via `@upstash/ratelimit` + `@upstash/redis`
- **Images:** `next.config.js` allows: `i.pravatar.cc`, `images.unsplash.com`, `res.cloudinary.com`, `lh3.googleusercontent.com`
- **Domain:** Not yet purchased — `vetalist.fr` used as placeholder. Update `NEXT_PUBLIC_APP_URL` when bought.
- **QR codes:** `qrcode.react` installed — used in print flyer only

---

## 📁 Current File Structure
```
src/
├── actions/
│   ├── admin.actions.ts         — toggleVetVerified, getActiveVets
│   ├── client.actions.ts        — getClientDashboardData, cancelAppointmentByClient,
│   │                              addPet, updatePet, archivePet,
│   │                              updateClientProfile, changePassword
│   ├── onboarding.actions.ts    — updateVetOnboarding, updateVetProfile, etc.
│   ├── password-reset.ts        — requestPasswordReset, validateResetToken, resetPassword
│   │                              ✅ uses db + sendEmail + rate limiting
│   └── vet.actions.ts           — confirmAppointment, cancelAppointment, toggles,
│                                  saveWorkingHours, getVetDashboardData,
│                                  getPendingVets, approveVet, rejectVet
│                                  ✅ sanitizeText() on rejection reason
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/layout.tsx + page.tsx    ✅ French, metadata in layout
│   │   ├── login/layout.tsx + page.tsx              ✅ fully French, metadata in layout
│   │   ├── onboarding/layout.tsx + page.tsx         ✅ metadata in layout
│   │   ├── register/layout.tsx + actions.ts + page.tsx ✅ fully French, metadata in layout
│   │   └── reset-password/layout.tsx + page.tsx     ✅ token cleared from URL on load
│   ├── (public)/
│   │   ├── search/page.tsx              ✅ metadata, works without login
│   │   └── vets/[id]/page.tsx           ✅ generateMetadata, type cast removed
│   ├── api/
│   │   ├── appointments/route.ts        ✅ POST + race condition + rate limit + vet email
│   │   ├── auth/oauth-intent/route.ts   ✅ NEW — server-side role token for Google OAuth
│   │   ├── availability/[vetId]/slots/route.ts — GET free slots
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── cron/reminders/route.ts
│   │   ├── search/route.ts
│   │   ├── search/suggestions/route.ts  ✅ rate limited (30 req/min)
│   │   └── vets/route.ts
│   ├── book/[vetId]/page.tsx            ✅ metadata, auth guard
│   ├── dashboard/
│   │   ├── admin/layout.tsx + page.tsx + vets + badges + users  ✅ all metadata, French
│   │   ├── client/layout.tsx + page.tsx + appointments + pets + settings ✅ all metadata
│   │   └── vet/layout.tsx + page.tsx + appointments + profile + settings ✅ all metadata
│   ├── legal/                           ❌ NOT BUILT — waiting for company info
│   ├── print/[vetId]/page.tsx           ✅ A5 flyer, public, no auth
│   ├── sitemap.ts                       ✅ static routes + all active vet profiles
│   ├── robots.ts                        ✅ blocks dashboards/api/book from Google
│   ├── error.tsx + not-found.tsx        ✅ French, animated
│   ├── layout.tsx                       ✅ root layout, base metadata, title template
│   └── page.tsx                         ✅ landing page, metadata
├── components/
│   ├── admin/
│   │   ├── AdminVetReview.tsx           ✅ fully French, XSS sanitized
│   │   ├── AdminVerifiedControl.tsx
│   │   └── AdminUsersTable.tsx
│   ├── booking/BookingWizard.tsx        — 5-step wizard
│   ├── client/
│   │   ├── AppointmentsClient.tsx       — tabs, cancel modal, badges
│   │   ├── PetsClient.tsx               — add/edit/archive modals
│   │   └── SettingsClient.tsx           — profile + password forms
│   ├── dashboard/NavLink.tsx            — shared active nav (usePathname)
│   ├── landing/Hero.tsx, Navbar.tsx, Features.tsx, HowItWorks.tsx, JoinAsVet.tsx, Footer.tsx
│   ├── search/SearchBar.tsx, VetCard.tsx, SearchFilters.tsx, MobileFilters.tsx
│   ├── vet/AppointmentTable.tsx, AvailabilityManager.tsx, MultiSelect.tsx,
│   │       PhotoUpload.tsx, ProfileEditor.tsx, SlotDurationPicker.tsx,
│   │       TimeOffManager.tsx, VetToggles.tsx
│   ├── CookieBanner.tsx                 ✅ GDPR: "Tout accepter" + "Essentiels uniquement"
│   └── PrintFlyer.tsx                   ✅ A5 flyer with QR code
├── emails/templates.ts                  ✅ 8 templates, all French
├── lib/
│   ├── auth.config.ts + auth.ts         ✅ Google OAuth uses server-side Redis token
│   ├── db.ts                            — Prisma singleton as `db`
│   ├── email.ts                         — sendEmail() via Resend
│   ├── get-next-slot.ts
│   ├── ratelimit.ts                     ✅ Upstash Redis rate limiters
│   ├── supabase/client.ts + server.ts
│   ├── utils.ts, prisma.ts, resend.ts, debug-utils.ts
│   └── validations/onboarding.ts
└── middleware.ts                        ✅ /book protected, /print public, search open
```

---

## 📧 Email Templates (emails/templates.ts)
All return `{ subject: string, html: string }`:

| Template | Trigger | Recipient |
|----------|---------|-----------|
| `confirmationEmail` | Vet confirms appointment | Client |
| `cancellationEmail` | Vet or client cancels | Client |
| `reminder24hEmail` | Cron job 24h before | Client |
| `reminder1hEmail` | Cron job 1h before | Client |
| `vetApprovedEmail` | Admin approves vet | Vet |
| `vetRejectedEmail` | Admin rejects vet (sanitized) | Vet |
| `forgotPasswordEmail` | User requests reset | User |
| `newBookingEmail` | Client books appointment | Vet |

EmailType enum: `CONFIRMATION, REMINDER_24H, REMINDER_1H, CANCELLATION, FORGOT_PASSWORD, NEW_BOOKING`

---

## 🔐 Rate Limiting (lib/ratelimit.ts)
- `suggestionsRatelimit` — 30 req/min per IP → search suggestions
- `appointmentsRatelimit` — 10 req/min per IP → booking creation
- `passwordResetRatelimit` — 5 req/15min per IP → password reset

---

## 🚀 Launch Checklist
- [x] Core booking flow working
- [x] Auth + roles + middleware
- [x] All dashboards (vet, client, admin)
- [x] Emails (all French, all 8 templates)
- [x] SEO + sitemap + robots
- [x] Mobile sidebars
- [x] Rate limiting (Upstash)
- [x] Cookie banner (GDPR)
- [x] Print flyer for vet outreach
- [x] French throughout
- [x] Security fixes (pending_role, reset token, XSS)
- [ ] Legal pages (waiting on company info)
- [ ] Domain purchased + NEXT_PUBLIC_APP_URL updated
- [ ] 10 vets onboarded in Île-de-France
- [ ] Deploy to Vercel

## 🚀 Recommended Next Steps (In Order)
1. **Legal pages** — once company info available
2. **Domain** — buy vetalist.fr, update NEXT_PUBLIC_APP_URL
3. **Deploy to Vercel** — production deployment
4. **Vet outreach** — send personal emails to Île-de-France vets
5. **Post-launch** — map view, geocoding, reviews, Stripe
