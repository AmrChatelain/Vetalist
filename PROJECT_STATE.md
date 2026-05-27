# Vetalist - Project State (Last Updated: 2026-05-24)

## 🎯 Business Decisions
- **Launch Market:** France → French is PRIMARY language for all UI labels, dates, times
- **English Localization:** Planned as Phase 2 after launch and user acquisition
- **Strategy:** Ship fast, fix/refine after launch. Architectural perfection ≠ broken functionality.
- **Booking Flow:** Standalone page `/book/[vetId]` (not modal) — shareable URL, mobile-friendly, simpler auth guard
- **Pre-launch Strategy:** Target 10 vets in Île-de-France first via personal email outreach, then launch to clients
- **Email Verification:** Skipped for launch — planned post-launch update (force all existing users to verify)

---

## 📊 Current Status (Ready to Launch)

### ✅ COMPLETE FEATURES
1. **Auth System** - Google OAuth + Credentials via NextAuth v5
2. **Status-Aware JWT & Middleware** - Role/status-based routing ("The Bouncer")
3. **Vet Onboarding Wizard** - Multi-step form → PENDING_APPROVAL status
4. **Vet Dashboard** - Stats, appointments, profile editor, settings, availability
5. **Admin Dashboard** - Vet review/approve/reject, user management, trusted badges
6. **Public Search Flow** - Vet cards + vet detail page (no login required) ✅
7. **Email System** - Resend templates: all French, all 8 templates complete ✅
8. **Cron Reminders** - Vercel cron every 30 min → sends 24h and 1h reminders, all fr-FR ✅
9. **Server Actions** - All operations covered (auth, onboarding, vet, admin, password-reset, client)
10. **Prisma Schema** - All models complete + @@unique([vetId, startTime]) ✅
11. **Error Pages** - `error.tsx` and `not-found.tsx` — French, animated ✅
12. **Booking Engine** - `/book/[vetId]` full 5-step wizard ✅
13. **Availability Slots API** - `GET /api/availability/[vetId]/slots?date=YYYY-MM-DD` ✅
14. **Appointments API** - `POST /api/appointments` with race condition guard + rate limit + XSS sanitize on reason ✅
15. **Client Dashboard** - Warm Garden redesign, Plus Jakarta Sans + Lora, pets as heroes, mobile-first ✅
16. **Client Dashboard CSS** - Separated into `app/dashboard/client/client-dashboard.css` ✅
17. **Client Actions** - Full CRUD for pets, appointments, profile ✅
18. **NavLink Component** - `icon: React.ReactNode` (NOT LucideIcon — server/client boundary fix) ✅
19. **Vet Layout** - French labels, NavLink icons as JSX, mobile hamburger + SheetTitle ✅
20. **Admin Layout** - French labels, NavLink icons as JSX, mobile hamburger + SheetTitle ✅
21. **Client Layout** - Warm Garden sidebar, mobile hamburger + SheetTitle (accessibility fix) ✅
22. **French Dates** - `full-icu` + `cross-env` (Windows compatible) ✅
23. **Image Domains** - All 4 hosts configured in next.config.js ✅
24. **Middleware** - `/book` protected, search open to all, `/print` public ✅
25. **Race Condition** - `@@unique([vetId, startTime])` + migration done ✅
26. **Mobile Sidebars** - All 3 dashboards have Sheet hamburger menu ✅
27. **SEO** - metadata on all pages, generateMetadata on vet profiles, sitemap.ts, robots.ts ✅
28. **Cookie Banner** - GDPR compliant, "Tout accepter" + "Essentiels uniquement" ✅
29. **Print Flyer** - `/print/[vetId]` — A5 printable page with QR code ✅
30. **Login page** - Fully French ✅
31. **Register page** - Fully French ✅
32. **Auth layout fix** - All "use client" auth pages moved metadata to layout.tsx files ✅
33. **Rate Limiting** - Upstash Redis on suggestions, appointments, password reset ✅
34. **Code Consistency** - db + sendEmail used everywhere ✅
35. **Security Fix 1** - `pending_role` cookie → server-side Redis token validation ✅
36. **Security Fix 2** - Password reset token cleared from URL immediately after validation ✅
37. **Security Fix 3** - XSS sanitization on vet rejection reason before email ✅
38. **Security Fix 4** - XSS sanitizeText() on booking reason in appointments API ✅
39. **Vet Booking Email** - Vet notified by email when client books (NEW_BOOKING enum) ✅
40. **Admin Review French** - All English labels translated in AdminVetReview ✅
41. **Dead Code Removed** - `api/vets/route.ts` + old `VetService` deleted (orphaned, unprotected POST) ✅
42. **Phone Validation** - French + international regex, enforced client AND server side ✅
43. **Password Validation** - min 8, max 72, 1 letter, 1 number — specific error messages, client AND server ✅
44. **`(vet as any)` cast removed** - `vet.acceptsEmergencies` used directly ✅
45. **Cron dates fr-FR** - Fixed en-GB → fr-FR in reminder emails ✅
46. **Pending Approval Page** - `/pending-approval` — vet sees status, rejection reason + resubmit CTA ✅
47. **Active Filters Bar** - `ActiveFiltersBar.tsx` — removable filter chips on search page ✅
48. **Specialties List** - Predefined French specialties in `lib/veterinary-specialties.ts` ✅
49. **Onboarding Validation** - Zod schema in `lib/validations/onboarding.ts` ✅
50. **JSON-LD Structured Data** - Organization + WebSite on homepage, VeterinaryCare on vet profiles ✅

---

### ❌ NOT YET BUILT

#### 🔴 Legal (Required Before Launch in France)
- [ ] Mentions Légales — `/legal/mentions-legales`
- [ ] Politique de Confidentialité — `/legal/confidentialite`
- [ ] CGU — `/legal/cgu`
- **Waiting on:** company name, SIRET, legal address, legal contact email

#### 🟡 Post-Launch — Phase 2
- [ ] Email verification on signup (post-launch — force existing users to verify)
- [ ] Map view on search results (Leaflet, free, no API key)
- [ ] Geocoding — auto lat/lng when vet saves address
- [ ] City landing pages for local SEO (`/vets/paris`, `/vets/lyon`)

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
2. **No email verification** on signup — anyone can register with unverified email
3. **Dead code in `services/`** — 3 files (`auth.service.ts`, `vet.service.ts`, `onboarding.service.ts`) not imported anywhere, should be deleted

---

## 🔧 Technical Notes
- **Framework:** Next.js 15.1.0 (Webpack — NOT Turbopack, crashes)
- **Database:** PostgreSQL via Prisma 5.22.0 (Supabase) — do NOT upgrade to 7.x before launch
- **Styling:** Tailwind CSS + shadcn/ui. Client dashboard uses `client-dashboard.css` (separate file)
- **Auth:** NextAuth v5 with Google OAuth + Credentials, JWT strategy
- **Email:** Resend — `sendEmail()` in `lib/email.ts`, templates in `emails/templates.ts`. Domain not verified yet — will work after vetalist.fr is bought and verified on resend.com/domains
- **Cron:** Vercel cron every 30 min
- **ICU/Locale:** `full-icu` + `cross-env` for French dates on Windows dev
- **Rate Limiting:** Upstash Redis (eu-west-1) via `@upstash/ratelimit` + `@upstash/redis`
- **Images:** `next.config.js` allows: `i.pravatar.cc`, `images.unsplash.com`, `res.cloudinary.com`, `lh3.googleusercontent.com`
- **Domain:** Not yet purchased — `vetalist.fr` used as placeholder. Update `NEXT_PUBLIC_APP_URL` + `RESEND_FROM` when bought.
- **QR codes:** `qrcode.react` installed — used in print flyer only
- **NavLink:** `icon` prop must be `React.ReactNode` — passing `LucideIcon` (component ref) causes Next.js server/client boundary error
- **SheetContent:** Always needs `<VisuallyHidden><SheetTitle>...</SheetTitle></VisuallyHidden>` inside — Radix Dialog accessibility requirement
- **DB client:** exported as `db` from `lib/db.ts` (NOT `prisma`)
- **Auth split:** `auth.config.ts` (edge, no Prisma) for middleware; `auth.ts` (Node) for app
- **JWT syncs from DB** only on `trigger === "signIn"` or `"update"` — not every request
- **vetStatus** lives on `VetProfile.status` not on `User` — always join `vetProfile`
- **searchParams** must be `await`ed in Next.js 15 (Promise type)
- **addressComplement** optional field on VetProfile — shown on public profile + included in all email address strings

---

## 📁 Current File Structure
```
src/
├── actions/
│   ├── admin.actions.ts         — toggleVetVerified, getActiveVets
│   ├── auth.actions.ts          — (new) auth-related server actions
│   ├── client.actions.ts        — getClientDashboardData, cancelAppointmentByClient,
│   │                              addPet, updatePet, archivePet,
│   │                              updateClientProfile (phone validated),
│   │                              changePassword (8 chars, 1 letter, 1 number, max 72)
│   ├── onboarding.actions.ts    — updateVetOnboarding, updateVetProfile, etc.
│   ├── password-reset.ts        — requestPasswordReset, validateResetToken, resetPassword
│   └── vet.actions.ts           — confirmAppointment, cancelAppointment, toggles,
│                                  saveWorkingHours, getVetDashboardData,
│                                  getPendingVets, approveVet, rejectVet
│                                  ✅ no (vet as any) casts, sanitizeText() on rejection
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/layout.tsx + page.tsx
│   │   ├── login/layout.tsx + page.tsx
│   │   ├── onboarding/layout.tsx + page.tsx
│   │   ├── register/layout.tsx + actions.ts + page.tsx
│   │   └── reset-password/layout.tsx + page.tsx
│   ├── (public)/
│   │   ├── search/page.tsx
│   │   └── vets/[id]/page.tsx
│   ├── api/
│   │   ├── appointments/route.ts        ✅ POST + race condition + rate limit + sanitizeText(reason)
│   │   ├── auth/oauth-intent/route.ts   ✅ server-side Redis role token
│   │   ├── auth/[...nextauth]/route.ts  — NextAuth v5 handler
│   │   ├── auth/[...nextauth]/routes.ts — (new) route definitions
│   │   ├── availability/route.ts        — fallback availability endpoint
│   │   ├── availability/[vetId]/slots/route.ts
│   │   ├── cron/reminders/route.ts      ✅ all dates fr-FR
│   │   ├── search/route.ts              ✅ multi-language, ZIP search, OR bug fixed
│   │   └── search/suggestions/route.ts  ✅ rate limited
│   ├── book/[vetId]/page.tsx
│   ├── dashboard/
│   │   ├── admin/
│   │   │   ├── layout.tsx + page.tsx
│   │   │   ├── vets/page.tsx            — vet review list
│   │   │   ├── badges/page.tsx          — trusted badge toggle
│   │   │   └── users/page.tsx           — user management
│   │   ├── client/
│   │   │   ├── client-dashboard.css     ✅ Warm Garden styles, separated from layout
│   │   │   ├── layout.tsx               ✅ imports CSS, SheetTitle fix, sidebar-inner split
│   │   │   ├── page.tsx                 ✅ Warm Garden redesign, pets as heroes
│   │   │   ├── appointments/page.tsx
│   │   │   ├── pets/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── vet/
│   │       ├── layout.tsx + page.tsx
│   │       ├── appointments/page.tsx
│   │       ├── profile/page.tsx
│   │       └── settings/page.tsx
│   ├── pending-approval/page.tsx        ✅ NEW — vet status/rejection/resubmit page
│   ├── print/[vetId]/page.tsx           ✅ A5 printable flyer with QR code
│   ├── legal/                           ❌ NOT BUILT — waiting for company info
│   ├── sitemap.ts                       ✅ static pages + all active vet profiles
│   ├── robots.ts                        ✅
│   ├── loading.tsx                      ✅ NEW — loading state page
│   ├── error.tsx + error.module.css     ✅ French, animated (separate CSS module)
│   ├── not-found.tsx + not-found.module.css ✅ French, animated (separate CSS module)
│   ├── layout.tsx                       ✅ title template, JSON-LD Organization+WebSite
│   └── page.tsx                         ✅ homepage
├── components/
│   ├── admin/
│   │   ├── AdminVetReview.tsx           ✅ fully French, XSS sanitized
│   │   ├── AdminVerifiedControl.tsx
│   │   └── AdminUsersTable.tsx
│   ├── booking/
│   │   └── BookingWizard.tsx            ✅ 5-step wizard
│   ├── client/
│   │   ├── AppointmentsClient.tsx
│   │   ├── PetsClient.tsx
│   │   └── SettingsClient.tsx           ✅ phone + password validation with error messages
│   ├── dashboard/
│   │   └── NavLink.tsx                  ✅ icon: React.ReactNode (NOT LucideIcon)
│   ├── landing/                         — reorganized into subdirectories
│   │   ├── Hero.tsx, Navbar.tsx
│   │   ├── features/Features.tsx
│   │   ├── footer/Footer.tsx
│   │   ├── how-it-works/HowItWorks.tsx
│   │   └── join-as-vet/JoinAsVet.tsx
│   ├── search/
│   │   ├── ActiveFiltersBar.tsx         ✅ NEW — removable filter chips
│   │   ├── SearchBar.tsx                ✅ X clears URL, debounceRef fixed
│   │   ├── SearchFilters.tsx            ✅ multi-language, per-section clear
│   │   ├── MobileFilters.tsx            ⚠️ NOT updated, single-select language (see VETALIST summary)
│   │   └── VetCard.tsx
│   ├── vet/
│   │   ├── AppointmentTable.tsx
│   │   ├── AvailabilityManager.tsx
│   │   ├── Multiselect.tsx              — renamed from MultiSelect.tsx
│   │   ├── PhotoUpload.tsx
│   │   ├── ProfileEditor.tsx            ✅ addressComplement, languagesSpoken default Français
│   │   ├── SlotDurationPicker.tsx
│   │   ├── TimeOffManager.tsx
│   │   └── VetToggles.tsx
│   ├── CookieBanner.tsx                 ✅ GDPR compliant
│   ├── PrintFlyer.tsx                   ✅ A5 flyer with QR code
│   ├── shared/                          — empty directory (reserved)
│   ├── vet-card/                        — empty directory (reserved)
│   └── ui/                              — shadcn/ui primitives
│       ├── badge.tsx, button.tsx, card.tsx, checkbox.tsx,
│       ├── collapsible.tsx, dialog.tsx, input.tsx, label.tsx,
│       ├── radio-group.tsx, separator.tsx, sheet.tsx, switch.tsx,
│       ├── tabs.tsx, textarea.tsx,
│       └── HamsterLoading.tsx           — custom loading component
├── emails/templates.ts                  ✅ 8 templates, all French
├── lib/
│   ├── auth.config.ts + auth.ts         — edge-safe split for middleware vs app
│   ├── db.ts                            — Prisma client exported as `db`
│   ├── email.ts                         — sendEmail() wrapper
│   ├── get-next-slot.ts                 — slot calculation helper
│   ├── ratelimit.ts                     — Upstash Redis rate limiters
│   ├── resend.ts                        — Resend config
│   ├── supabase/client.ts + server.ts   — Supabase client (anon key)
│   ├── utils.ts                         — shared utilities
│   ├── prisma.ts                        — Prisma singleton
│   ├── debug-utils.ts                   — debugging helpers
│   ├── veterinary-specialties.ts        ✅ NEW — predefined French specialties list
│   └── validations/
│       └── onboarding.ts                ✅ NEW — zod schema for vet onboarding
├── services/                            ⚠️ DEAD CODE — not imported anywhere
│   ├── auth.service.ts                  — registerUser (unused)
│   ├── vet.service.ts                   — VetService (unused, old pattern)
│   └── onboarding.service.ts            — completeVetProfile (unused)
├── types/
│   └── next-auth.d.ts                   ✅ NEW — NextAuth type declarations
└── middleware.ts                        — route protection + search open to all
```

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
- [x] SEO + sitemap + robots + JSON-LD structured data
- [x] Mobile sidebars + accessibility (SheetTitle)
- [x] Rate limiting (Upstash)
- [x] Cookie banner (GDPR)
- [x] Print flyer for vet outreach
- [x] French throughout (including cron reminder dates)
- [x] All security fixes
- [x] Input validation (phone + password) client + server
- [x] Dead code removed (api/vets, VetService old pattern)
- [x] Client dashboard redesigned (Warm Garden, mobile-first)
- [x] Pending approval page for vets
- [x] Active filters bar on search
- [ ] Legal pages (waiting on company info)
- [ ] Domain purchased + NEXT_PUBLIC_APP_URL updated
- [ ] Resend domain verified at resend.com/domains
- [ ] 10 vets onboarded in Île-de-France
- [ ] Deploy to Vercel

## 🚀 Recommended Next Steps (In Order)
1. **Fix MobileFilters.tsx** — multi-select language (same as SearchFilters.tsx)
2. **Clean up dead code** — delete `services/` folder (3 unused files)
3. **Domain** — buy vetalist.fr, update NEXT_PUBLIC_APP_URL + RESEND_FROM
4. **Resend** — verify vetalist.fr domain on resend.com/domains (emails currently blocked)
5. **Legal pages** — once company info available
6. **Deploy to Vercel** — production deployment
7. **Vet outreach** — send personal emails to Île-de-France vets
8. **Post-launch** — email verification, map view, geocoding, reviews, Stripe
