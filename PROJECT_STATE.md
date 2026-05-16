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
6. **Public Search Flow** - Vet cards + vet detail page (no login required) ✅ fixed unauthenticated access
7. **Email System** - Resend templates: confirmation, cancellation, approval, rejection, forgot password, 24h/1h reminders
8. **Cron Reminders** - Vercel cron every 30 min → sends 24h and 1h appointment reminders
9. **Server Actions** - All operations covered (auth, onboarding, vet, admin, password-reset, client)
10. **Prisma Schema** - User, VetProfile, Pet, Appointment, WorkingHour, AvailabilityBlock, PasswordResetToken, EmailLog
11. **Error Pages** - `error.tsx` and `not-found.tsx` built with French content + animations
12. **Booking Engine** - `/book/[vetId]` full 5-step wizard (Motif → Animal → Créneau → Résumé → Succès)
13. **Availability Slots API** - `GET /api/availability/[vetId]/slots?date=YYYY-MM-DD`
14. **Appointments API** - `POST /api/appointments` with race condition guard (conflict check before insert)
15. **Client Dashboard** - Overview with stats, upcoming appointments, pets summary, CTA
16. **Client Appointments Page** - Tabs (à venir / passés), cancel with modal + email, status badges
17. **Client Pets Page** - Add/edit/archive with modal, species picker, full form
18. **Client Settings Page** - Profile update + password change (Google users see Google notice)
19. **Client Layout** - Dark sidebar, French labels, active nav state, role-based auth guard
20. **Client Actions** - `client.actions.ts`: getClientDashboardData, cancelAppointmentByClient, addPet, updatePet, archivePet, updateClientProfile, changePassword
21. **NavLink Component** - `components/dashboard/NavLink.tsx` — shared, handles active state via usePathname
22. **Vet Layout Fixed** - French labels, active nav via NavLink, unused import removed, correct locale
23. **Vet Dashboard Page** - Overview with stats (today / pending / this week) + upcoming appointments list
24. **French Dates Fixed** - `full-icu` + `cross-env` installed, `package.json` scripts updated (Windows-compatible)
25. **Image Domains Fixed** - `lh3.googleusercontent.com` added to `next.config.js`
26. **Middleware Fixed** - `/book/[vetId]` protected, unauthenticated users redirect to `/login?callbackUrl=`
27. **Search Fixed** - Unauthenticated users can search freely, only blocked from booking

---

### ❌ NOT YET BUILT

#### 🔴 Legal (Required Before Launch in France)
- [ ] Mentions Légales page (`/legal/mentions-legales`) — French law mandatory
- [ ] Politique de Confidentialité (`/legal/confidentialite`) — GDPR mandatory
- [ ] CGU — Conditions Générales d'Utilisation (`/legal/cgu`)
- [ ] Cookie consent banner — GDPR mandatory (stores preference)
- [ ] Refund/Cancellation policy (when Stripe added)

**Needs from owner before building:** company name, SIRET, legal address, legal contact email

#### 🟠 Critical Before Launch
- [ ] Prisma race condition constraint — `@@unique([vetId, startTime])` in schema + migration
- [ ] Mobile sidebars — vet, client, admin dashboards (currently hidden on mobile, no hamburger)
- [ ] SEO — `metadata` exports per page, `sitemap.xml`, `robots.txt`

#### 🟡 Important Before Launch
- [ ] Rate limiting on `/api/search/suggestions` and `/api/appointments`
- [ ] Geocoding — auto-fill lat/lng when vet saves address in onboarding/profile
- [ ] Map view on search results (Mapbox or Leaflet) using existing lat/lng fields

#### 🔵 Post-Launch (Phase 3)
- [ ] Reviews/ratings system for vets
- [ ] Client report system for scam/closed clinics
- [ ] Re-verification flow (admin un-verifies, vet reconfirms)
- [ ] Subscription system for vets (Stripe)
- [ ] Vet analytics dashboard
- [ ] Multi-language support (Arabic)
- [ ] Push notifications
- [ ] Admin newsletter / bulk email to vets
- [ ] PDF appointment reports for vets

---

## ⚠️ Known Issues / Technical Debt

### 🔴 Fix Before Launch
1. **Race condition** — two clients can book same slot simultaneously. Fix: `@@unique([vetId, startTime])` in schema + `prisma migrate dev`
2. **Legal pages missing** — GDPR + French law requires mentions légales, privacy policy, CGU, cookie banner
3. **No mobile sidebar** — dashboards are unusable on mobile without hamburger menu

### 🟡 Fix Soon After Launch
4. **`getVetDashboardData`** loads ALL appointments into memory then filters → N+1 at scale
5. **Inline `<style>` tags** in dashboard layouts → should use Tailwind consistently
6. **`(vet as any).acceptsEmergencies`** type assertion in vet profile page → needs proper typing
7. **No rate limiting** on `/api/search/suggestions` — DDoS vector
8. **Password reset token in URL** — leaks to browser history/logs. Should use POST body
9. **`pending_role` cookie** — attacker could manipulate to register as VET. Needs server-side validation
10. **No input sanitization** on vet rejection reason → XSS vector in email template

### ✅ Already Fixed This Session
- ~~Cancel guard missing on client side~~ → `cancelAppointmentByClient` checks status before allowing cancel
- ~~English labels in vet dashboard~~ → all French now
- ~~Active nav state not working~~ → NavLink component with usePathname
- ~~`en-GB` locale in vet.actions.ts~~ → changed to `fr-FR`
- ~~Search blocked for unauthenticated users~~ → middleware fixed
- ~~`/book/[vetId]` not protected~~ → added to middleware unauthenticated block

---

## 🔧 Technical Notes
- **Framework:** Next.js 15.1.0 (Webpack-based, not Turbopack — crashes)
- **Database:** PostgreSQL via Prisma ORM (Supabase)
- **Styling:** Tailwind CSS + shadcn/ui + inline `<style>` for dashboard layouts
- **Auth:** NextAuth v5 with Google OAuth + Credentials
- **Email:** Resend — `sendEmail()` in `lib/email.ts`, templates in `emails/templates.ts`
- **Cron:** Vercel cron every 30 min
- **ICU/Locale:** `full-icu` + `cross-env` installed for French dates on Windows dev
- **Images:** `next.config.js` allows: `i.pravatar.cc`, `images.unsplash.com`, `res.cloudinary.com`, `lh3.googleusercontent.com`

---

## 📁 Current File Structure
```
src/
├── actions/
│   ├── admin.actions.ts         — toggleVetVerified, getActiveVets
│   ├── client.actions.ts        ✅ NEW — getClientDashboardData, cancelAppointmentByClient,
│   │                                     addPet, updatePet, archivePet,
│   │                                     updateClientProfile, changePassword
│   ├── onboarding.actions.ts    — updateVetOnboarding, updateVetProfile, etc.
│   ├── password-reset.ts        — requestPasswordReset, validateResetToken, resetPassword
│   └── vet.actions.ts           — confirmAppointment, cancelAppointment, toggles,
│                                  saveWorkingHours, getVetDashboardData,
│                                  getPendingVets, approveVet, rejectVet
│                                  ✅ FIXED: locale fr-FR, email signature corrected
├── app/
│   ├── (auth)/                  — login, register, forgot-password, reset-password, onboarding
│   ├── (public)/
│   │   ├── search/page.tsx      — ✅ FIXED: works without login
│   │   └── vets/[id]/page.tsx   — public vet profile, book button
│   ├── api/
│   │   ├── appointments/route.ts         ✅ NEW — POST creates appointment, race condition guard
│   │   ├── availability/route.ts         — placeholder
│   │   ├── availability/[vetId]/slots/   ✅ NEW — GET returns free slots for a date
│   │   │   └── route.ts
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── cron/reminders/route.ts
│   │   ├── search/route.ts + suggestions/route.ts
│   │   └── vets/route.ts
│   ├── book/
│   │   └── [vetId]/page.tsx     ✅ NEW — booking page, auth guard, fetches vet + pets
│   ├── dashboard/
│   │   ├── admin/               — layout, page, vets, badges, users
│   │   ├── client/
│   │   │   ├── layout.tsx       ✅ NEW — dark sidebar, French, violet accent
│   │   │   ├── page.tsx         ✅ NEW — overview: stats, upcoming RDV, pets summary
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx     ✅ NEW — tabs: à venir / passés, cancel modal
│   │   │   ├── pets/
│   │   │   │   └── page.tsx     ✅ NEW — add/edit/archive pets
│   │   │   └── settings/
│   │   │       └── page.tsx     ✅ NEW — profile + password change
│   │   └── vet/
│   │       ├── layout.tsx       ✅ FIXED — French labels, NavLink, fr-FR date
│   │       ├── page.tsx         ✅ NEW — stats + upcoming appointments overview
│   │       ├── appointments/    — confirm/cancel table
│   │       ├── profile/         — photo + ProfileEditor
│   │       └── settings/        — working hours, time off, toggles
│   ├── legal/                   ❌ NOT BUILT — mentions légales, CGU, confidentialité
│   ├── pending-approval/
│   ├── layout.tsx               — root layout with <Toaster />
│   └── page.tsx                 — landing page
├── components/
│   ├── admin/                   — AdminVetReview, AdminVerifiedControl, AdminUsersTable
│   ├── booking/
│   │   └── BookingWizard.tsx    ✅ NEW — 5-step wizard: Motif→Animal→Créneau→Résumé→Succès
│   ├── client/
│   │   ├── AppointmentsClient.tsx  ✅ NEW — tabs, cancel modal, status badges
│   │   ├── PetsClient.tsx          ✅ NEW — add/edit/archive modals
│   │   └── SettingsClient.tsx      ✅ NEW — profile form + password form
│   ├── dashboard/
│   │   └── NavLink.tsx          ✅ NEW — shared active nav link (usePathname)
│   ├── landing/                 — Hero, Navbar, Features, HowItWorks, JoinAsVet, Footer
│   ├── search/                  — SearchBar, VetCard, SearchFilters, MobileFilters
│   └── vet/                     — AppointmentTable, AvailabilityManager, MultiSelect,
│                                  PhotoUpload, ProfileEditor, SlotDurationPicker,
│                                  TimeOffManager, VetToggles
├── emails/
│   └── templates.ts             — all French email templates
├── lib/
│   ├── auth.config.ts + auth.ts
│   ├── db.ts                    — Prisma singleton exported as `db`
│   ├── email.ts                 — sendEmail() via Resend
│   ├── get-next-slot.ts         — slot calculation
│   └── validations/onboarding.ts
└── middleware.ts                ✅ FIXED — /book protected, search open to all
```

---

## 🚀 Recommended Next Steps (In Order)

1. **Legal pages** — get company info from owner, build mentions légales + CGU + privacy + cookie banner
2. **Race condition fix** — one line in schema + `prisma migrate dev`
3. **Mobile sidebars** — hamburger menu for vet + client + admin
4. **SEO** — metadata per page + sitemap.xml
5. **Rate limiting** — `/api/search/suggestions` + `/api/appointments`
6. **Map view** — search results map using existing lat/lng
7. **Geocoding** — auto lat/lng on vet address save
