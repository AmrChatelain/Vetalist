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
7. **Email System** - Resend templates: all French, all templates complete
8. **Cron Reminders** - Vercel cron every 30 min → sends 24h and 1h reminders
9. **Server Actions** - All operations covered (auth, onboarding, vet, admin, password-reset, client)
10. **Prisma Schema** - All models complete + @@unique([vetId, startTime]) ✅
11. **Error Pages** - `error.tsx` and `not-found.tsx` — French, animated ✅
12. **Booking Engine** - `/book/[vetId]` full 5-step wizard ✅
13. **Availability Slots API** - `GET /api/availability/[vetId]/slots?date=YYYY-MM-DD` ✅
14. **Appointments API** - `POST /api/appointments` with race condition guard + rate limiting ✅
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
33. **Code Consistency** - password-reset.ts uses `db` + `sendEmail` consistently ✅
34. **Type Safety** - Removed `(vet as any).acceptsEmergencies` cast in vet profile page ✅

---

### ❌ NOT YET BUILT

#### 🔴 Legal (Required Before Launch in France)
- [ ] Mentions Légales — `/legal/mentions-legales`
- [ ] Politique de Confidentialité — `/legal/confidentialite`
- [ ] CGU — `/legal/cgu`
- **Waiting on:** company name, SIRET, legal address, legal contact email from owner
- **Plan:** build once 10 vets are onboarded and company info is ready

#### 🟡 Post-Launch — Phase 2
- [ ] Map view on search results (Leaflet, free, no API key)
- [ ] Geocoding — auto lat/lng when vet saves address
- [ ] Rate limiting on password reset email endpoint (done on action, not email)

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

### 🟡 Fix Before or Shortly After Launch
1. **Password reset token in URL** — leaks to browser history/logs. Should use POST body instead
2. **`pending_role` cookie** — attacker could manipulate to register as VET. Needs server-side validation
3. **No input sanitization** on vet rejection reason → XSS vector in email template
4. **`getVetDashboardData`** loads ALL appointments into memory then filters → N+1 at scale
5. **Inline `<style>` tags** in dashboard layouts → should use Tailwind consistently
6. **No JSON-LD structured data** — missing Organization + VeterinaryCare schema for SEO

### ✅ Fixed This Session
- ~~Race condition~~ → `@@unique([vetId, startTime])` + migration ✅
- ~~Mobile sidebars missing~~ → all 3 dashboards have hamburger ✅
- ~~SEO missing~~ → metadata + sitemap + robots ✅
- ~~English labels in dashboards~~ → all French ✅
- ~~Active nav state~~ → NavLink component ✅
- ~~`en-GB` locale~~ → `fr-FR` ✅
- ~~Search blocked unauthenticated~~ → middleware fixed ✅
- ~~`/book/[vetId]` unprotected~~ → middleware fixed ✅
- ~~Login page English~~ → fully French ✅
- ~~Register page English~~ → fully French ✅
- ~~metadata on "use client" pages~~ → moved to layout.tsx files ✅
- ~~Cookie banner missing~~ → GDPR compliant banner with 2 options ✅
- ~~Print flyer missing~~ → `/print/[vetId]` with QR code ✅
- ~~Admin layout had wrong nav items~~ → fixed to admin routes ✅
- ~~No rate limiting~~ → Upstash Redis on 3 attack vectors ✅
- ~~`prisma` import in password-reset.ts~~ → now uses `db` consistently ✅
- ~~`resend.emails.send()` in password-reset.ts~~ → now uses `sendEmail()` ✅
- ~~`(vet as any).acceptsEmergencies`~~ → type cast removed ✅

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
│   │                              ✅ FIXED: uses db + sendEmail + rate limiting
│   └── vet.actions.ts           — confirmAppointment, cancelAppointment, toggles,
│                                  saveWorkingHours, getVetDashboardData,
│                                  getPendingVets, approveVet, rejectVet
│                                  ✅ FIXED: locale fr-FR
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/layout.tsx + page.tsx    ✅ French, metadata in layout
│   │   ├── login/layout.tsx + page.tsx              ✅ fully French, metadata in layout
│   │   ├── onboarding/layout.tsx + page.tsx         ✅ metadata in layout
│   │   ├── register/layout.tsx + actions.ts + page.tsx ✅ fully French, metadata in layout
│   │   └── reset-password/layout.tsx + page.tsx     ✅ metadata in layout
│   ├── (public)/
│   │   ├── search/page.tsx              ✅ metadata, works without login
│   │   └── vets/[id]/page.tsx           ✅ generateMetadata, type cast removed
│   ├── api/
│   │   ├── appointments/route.ts        ✅ POST + race condition guard + rate limiting
│   │   ├── availability/[vetId]/slots/route.ts — GET free slots
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── cron/reminders/route.ts
│   │   ├── search/route.ts
│   │   ├── search/suggestions/route.ts  ✅ rate limited (30 req/min)
│   │   └── vets/route.ts
│   ├── book/[vetId]/page.tsx            ✅ metadata, auth guard
│   ├── dashboard/
│   │   ├── admin/layout.tsx + page.tsx + vets + badges + users  ✅ all metadata
│   │   ├── client/layout.tsx + page.tsx + appointments + pets + settings ✅ all metadata
│   │   └── vet/layout.tsx + page.tsx + appointments + profile + settings ✅ all metadata
│   ├── legal/                           ❌ NOT BUILT — waiting for company info
│   │   ├── mentions-legales/page.tsx
│   │   ├── confidentialite/page.tsx
│   │   └── cgu/page.tsx
│   ├── print/[vetId]/page.tsx           ✅ A5 flyer, public, no auth
│   ├── sitemap.ts                       ✅ static routes + all active vet profiles
│   ├── robots.ts                        ✅ blocks dashboards/api/book from Google
│   ├── error.tsx                        ✅ French, animated
│   ├── not-found.tsx                    ✅ French, animated
│   ├── layout.tsx                       ✅ root layout, base metadata, title template
│   └── page.tsx                         ✅ landing page, metadata
├── components/
│   ├── admin/                           — AdminVetReview, AdminVerifiedControl, AdminUsersTable
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
├── emails/templates.ts                  — all French email templates
├── lib/
│   ├── auth.config.ts + auth.ts
│   ├── db.ts                            — Prisma singleton as `db`
│   ├── email.ts                         — sendEmail() via Resend
│   ├── get-next-slot.ts
│   ├── ratelimit.ts                     ✅ NEW — Upstash Redis rate limiters
│   ├── supabase/client.ts + server.ts
│   ├── utils.ts, prisma.ts, resend.ts, debug-utils.ts
│   └── validations/onboarding.ts
└── middleware.ts                        ✅ /book protected, /print public, search open
```

---

## 🗂️ SEO Metadata Checklist
### Public (indexed)
- `app/page.tsx` ✅
- `app/(public)/search/page.tsx` ✅
- `app/(public)/vets/[id]/page.tsx` ✅ (generateMetadata)

### Auth (not indexed) — metadata in layout.tsx files
- `app/(auth)/login/layout.tsx` ✅
- `app/(auth)/register/layout.tsx` ✅
- `app/(auth)/forgot-password/layout.tsx` ✅
- `app/(auth)/reset-password/layout.tsx` ✅
- `app/(auth)/onboarding/layout.tsx` ✅

### Booking + Print (not indexed)
- `app/book/[vetId]/page.tsx` ✅
- `app/print/[vetId]/page.tsx` ✅

### All dashboard pages (not indexed) ✅
### Root: sitemap.ts + robots.ts ✅

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
- [x] Emails (all French)
- [x] SEO + sitemap + robots
- [x] Mobile sidebars
- [x] Rate limiting
- [x] Cookie banner (GDPR)
- [x] Print flyer for vet outreach
- [x] French throughout
- [ ] Legal pages (waiting on company info)
- [ ] Domain purchased + NEXT_PUBLIC_APP_URL updated
- [ ] 10 vets onboarded in Île-de-France
- [ ] Deploy to Vercel

## 🚀 Recommended Next Steps (In Order)
1. **Fix remaining security issues** — see Known Issues above
2. **Legal pages** — once company info available
3. **Domain** — buy vetalist.fr, update NEXT_PUBLIC_APP_URL everywhere
4. **Deploy to Vercel** — production deployment
5. **Vet outreach** — send personal emails to Île-de-France vets
6. **Post-launch** — map view, geocoding, reviews, Stripe
