# Vetalist - Project State (Last Updated: 2026-05-16)

## 🎯 Business Decisions
- **Launch Market:** France → French is PRIMARY language for all UI labels, dates, times
- **English Localization:** Planned as Phase 2 after launch and user acquisition
- **Strategy:** Ship fast, fix/refine after launch. Architectural perfection ≠ broken functionality.
- **Booking Flow:** Standalone page `/book/[vetId]` (not modal) — shareable URL, mobile-friendly, simpler auth guard

---

## 📊 Current Status

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
14. **Appointments API** - `POST /api/appointments` with race condition guard ✅
15. **Client Dashboard** - Overview, appointments, pets, settings ✅
16. **Client Actions** - Full CRUD for pets, appointments, profile ✅
17. **NavLink Component** - Shared active state for all dashboards ✅
18. **Vet Layout** - French labels, NavLink, mobile hamburger ✅
19. **Admin Layout** - Fixed nav items, French labels, mobile hamburger ✅
20. **Client Layout** - Violet accent, French, mobile hamburger ✅
21. **French Dates** - `full-icu` + `cross-env` (Windows compatible) ✅
22. **Image Domains** - All 4 hosts configured in next.config.js ✅
23. **Middleware** - `/book` protected, search open to all ✅
24. **Race Condition** - `@@unique([vetId, startTime])` + migration done ✅
25. **Mobile Sidebars** - All 3 dashboards have Sheet hamburger menu ✅
26. **SEO** - metadata on all pages, generateMetadata on vet profiles, sitemap.ts, robots.ts ✅

---

### ❌ NOT YET BUILT

#### 🔴 Legal (Required Before Launch in France)
- [ ] Mentions Légales — `/legal/mentions-legales`
- [ ] Politique de Confidentialité — `/legal/confidentialite`
- [ ] CGU — `/legal/cgu`
- [ ] Cookie consent banner (GDPR)
- **Needs from owner:** company name, SIRET, legal address, legal contact email

#### 🟡 Before Launch — Nice to Have
- [ ] Rate limiting on `/api/search/suggestions` + `/api/appointments`
- [ ] Geocoding — auto lat/lng when vet saves address
- [ ] Map view on search results

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

### 🟡 Fix Soon After Launch
1. **`getVetDashboardData`** loads ALL appointments into memory then filters → N+1 at scale
2. **Inline `<style>` tags** in dashboard layouts → should use Tailwind consistently
3. **`(vet as any).acceptsEmergencies`** type assertion in vet profile page → needs proper typing
4. **No rate limiting** on `/api/search/suggestions` — DDoS vector
5. **Password reset token in URL** — leaks to browser history. Should use POST body
6. **`pending_role` cookie** — attacker could manipulate to register as VET
7. **No input sanitization** on vet rejection reason → XSS in email
8. **Error/not-found pages have no `robots: { index: false }`** — should prevent indexing of non-content pages
9. **No JSON-LD structured data** anywhere — missing Organization + VeterinaryCare schema for SEO

### ✅ Fixed This Session
- ~~Race condition~~ → `@@unique([vetId, startTime])` + migration ✅
- ~~Mobile sidebars missing~~ → all 3 dashboards have hamburger ✅
- ~~SEO missing~~ → metadata + sitemap + robots ✅
- ~~English labels in dashboards~~ → all French ✅
- ~~Active nav state~~ → NavLink component ✅
- ~~`en-GB` locale~~ → `fr-FR` ✅
- ~~Search blocked unauthenticated~~ → middleware fixed ✅
- ~~`/book/[vetId]` unprotected~~ → middleware fixed ✅
- **Favicon/OG/Twitter image typo** → `Vitalist-logo.png` renamed to `Vetalist-logo.png`, all 3 references in `layout.tsx` fixed ✅

---

## 🔧 Technical Notes
- **Framework:** Next.js 15.1.0 (Webpack — NOT Turbopack, crashes)
- **Database:** PostgreSQL via Prisma 5.22.0 (Supabase) — do NOT upgrade to 7.x before launch
- **Styling:** Tailwind CSS + shadcn/ui + inline `<style>` for dashboard layouts
- **Auth:** NextAuth v5 with Google OAuth + Credentials
- **Email:** Resend — `sendEmail()` in `lib/email.ts`, templates in `emails/templates.ts`
- **Cron:** Vercel cron every 30 min
- **ICU/Locale:** `full-icu` + `cross-env` for French dates on Windows dev
- **Images:** `next.config.js` allows: `i.pravatar.cc`, `images.unsplash.com`, `res.cloudinary.com`, `lh3.googleusercontent.com`
- **Domain:** Not yet purchased — `vetalist.fr` used as placeholder. Update `NEXT_PUBLIC_APP_URL` when bought.

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
│   └── vet.actions.ts           — confirmAppointment, cancelAppointment, toggles,
│                                  saveWorkingHours, getVetDashboardData,
│                                  getPendingVets, approveVet, rejectVet
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/page.tsx     ✅ metadata
│   │   ├── login/page.tsx               ✅ metadata
│   │   ├── onboarding/page.tsx          ✅ metadata
│   │   ├── register/page.tsx            ✅ metadata
│   │   └── reset-password/page.tsx      ✅ metadata
│   ├── (public)/
│   │   ├── search/page.tsx              ✅ metadata, works without login
│   │   └── vets/[id]/page.tsx           ✅ generateMetadata (dynamic per vet)
│   ├── api/
│   │   ├── appointments/route.ts        — POST + race condition guard
│   │   ├── availability/[vetId]/slots/route.ts — GET free slots
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── cron/reminders/route.ts
│   │   ├── search/route.ts + suggestions/route.ts
│   │   └── vets/route.ts
│   ├── book/
│   │   └── [vetId]/page.tsx             ✅ metadata, auth guard
│   ├── dashboard/
│   │   ├── admin/
│   │   │   ├── layout.tsx               ✅ fixed nav, French, mobile hamburger
│   │   │   ├── page.tsx                 ✅ metadata
│   │   │   ├── vets/page.tsx            ✅ metadata
│   │   │   ├── badges/page.tsx          ✅ metadata
│   │   │   └── users/page.tsx           ✅ metadata
│   │   ├── client/
│   │   │   ├── layout.tsx               ✅ violet, French, mobile hamburger
│   │   │   ├── page.tsx                 ✅ metadata
│   │   │   ├── appointments/page.tsx    ✅ metadata
│   │   │   ├── pets/page.tsx            ✅ metadata
│   │   │   └── settings/page.tsx        ✅ metadata
│   │   └── vet/
│   │       ├── layout.tsx               ✅ French, NavLink, mobile hamburger
│   │       ├── page.tsx                 ✅ metadata
│   │       ├── appointments/page.tsx    ✅ metadata
│   │       ├── profile/page.tsx         ✅ metadata
│   │       └── settings/page.tsx        ✅ metadata
│   ├── legal/                           ❌ NOT BUILT
│   │   ├── mentions-legales/page.tsx
│   │   ├── confidentialite/page.tsx
│   │   └── cgu/page.tsx
│   ├── sitemap.ts                       ✅ auto-generates with all active vet profiles
│   ├── robots.ts                        ✅ blocks dashboards/api/book from Google
│   ├── error.tsx                        ✅ French, animated
│   ├── not-found.tsx                    ✅ French, animated
│   ├── layout.tsx                       ✅ root layout, base metadata, title template
│   └── page.tsx                         ✅ landing page, metadata
├── components/
│   ├── admin/                           — AdminVetReview, AdminVerifiedControl, AdminUsersTable
│   ├── booking/
│   │   └── BookingWizard.tsx            — 5-step wizard
│   ├── client/
│   │   ├── AppointmentsClient.tsx       — tabs, cancel modal, badges
│   │   ├── PetsClient.tsx               — add/edit/archive modals
│   │   └── SettingsClient.tsx           — profile + password forms
│   ├── dashboard/
│   │   └── NavLink.tsx                  — shared active nav (usePathname)
│   ├── landing/
│   │   ├── Hero.tsx, Navbar.tsx, Features.tsx
│   │   ├── HowItWorks.tsx, JoinAsVet.tsx, Footer.tsx
│   ├── search/
│   │   ├── SearchBar.tsx, VetCard.tsx
│   │   ├── SearchFilters.tsx, MobileFilters.tsx
│   └── vet/
│       ├── AppointmentTable.tsx, AvailabilityManager.tsx
│       ├── MultiSelect.tsx, PhotoUpload.tsx
│       ├── ProfileEditor.tsx, SlotDurationPicker.tsx
│       ├── TimeOffManager.tsx, VetToggles.tsx
├── emails/
│   └── templates.ts                     — all French email templates
├── lib/
│   ├── auth.config.ts + auth.ts
│   ├── db.ts                            — Prisma singleton as `db`
│   ├── email.ts                         — sendEmail() via Resend
│   ├── get-next-slot.ts
│   ├── supabase/client.ts + server.ts
│   ├── utils.ts, prisma.ts, resend.ts, debug-utils.ts
│   └── validations/onboarding.ts
└── middleware.ts                        ✅ /book protected, search open
```

---

## 🗂️ SEO Metadata Checklist
### Public (indexed)
- `app/page.tsx` ✅
- `app/(public)/search/page.tsx` ✅
- `app/(public)/vets/[id]/page.tsx` ✅ (generateMetadata)

### Auth (not indexed)
- `app/(auth)/login/page.tsx` ✅
- `app/(auth)/register/page.tsx` ✅
- `app/(auth)/forgot-password/page.tsx` ✅
- `app/(auth)/reset-password/page.tsx` ✅
- `app/(auth)/onboarding/page.tsx` ✅

### Booking (not indexed)
- `app/book/[vetId]/page.tsx` ✅

### Client dashboard (not indexed)
- `app/dashboard/client/page.tsx` ✅
- `app/dashboard/client/appointments/page.tsx` ✅
- `app/dashboard/client/pets/page.tsx` ✅
- `app/dashboard/client/settings/page.tsx` ✅

### Vet dashboard (not indexed)
- `app/dashboard/vet/page.tsx` ✅
- `app/dashboard/vet/appointments/page.tsx` ✅
- `app/dashboard/vet/profile/page.tsx` ✅
- `app/dashboard/vet/settings/page.tsx` ✅

### Admin dashboard (not indexed)
- `app/dashboard/admin/page.tsx` ✅
- `app/dashboard/admin/vets/page.tsx` ✅
- `app/dashboard/admin/badges/page.tsx` ✅
- `app/dashboard/admin/users/page.tsx` ✅

### Root SEO files
- `app/layout.tsx` ✅ — base metadata + title template "%s | Vetalist"
- `app/sitemap.ts` ✅ — static routes + all active vet profiles
- `app/robots.ts` ✅ — allows /, /search, /vets/ — blocks everything else

---

## 🚀 Recommended Next Steps (In Order)
1. **Legal pages** — need company name, SIRET, address, legal email from owner
2. **Rate limiting** — can build now, no info needed
3. **Map view** — search results using existing lat/lng fields
4. **Geocoding** — auto lat/lng on vet address save
5. **Domain** — buy vetalist.fr, update NEXT_PUBLIC_APP_URL everywhere
