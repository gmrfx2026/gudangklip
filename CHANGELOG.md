# Changelog

Semua perubahan penting pada project GudangKlip dicatat di sini.

---

## [0.1.7] - 2026-06-22

### Brand Dashboard Redesign — Budget, Settings, Analytics & Campaign Detail

#### Halaman Baru: Budget (`/brand/budget`)
- `src/actions/budget.actions.ts` (NEW) — `getBrandBudget()`: wallet balance + campaign budget list + transaction history
- `src/app/[locale]/(dashboard)/brand/budget/page.tsx` (NEW) — Balance card dengan Top Up (Midtrans Snap) + History table (Completed | On Process tabs)

#### Halaman Baru: Settings (`/brand/settings`)
- `src/app/[locale]/(dashboard)/brand/settings/page.tsx` (NEW) — Logo upload, Company Profile | Security tabs, Company Name input, Industry select dropdown (10 industri)

#### Database: Brand Fields
- `prisma/schema.prisma` — `Industry` enum (10 values) + field `companyName` + `industry` di model User
- `prisma/migrations/20260621194900_add_brand_fields/` (NEW) — migration untuk kolom baru
- `prisma/seed.ts` — seed data untuk `companyName` + `industry` pada brand users

#### Registration Extended
- `src/app/api/auth/register/route.ts` — validasi: Brand wajib isi `companyName` + `industry` saat registrasi
- `src/app/[locale]/(auth)/register/page.tsx` — input `companyName` + `industry` di form registrasi brand
- `src/lib/validations.ts` — `registerSchema` diperluas dengan `companyName` (min 2 karakter) + `industry` (enum validation)

#### Dashboard Redesign (`/brand`)
- **Overview** (`/brand/page.tsx`): Welcome greeting + 4 stat cards (Views, Need to Review, Total Submissions, Budget Spent) + Add Campaign CTA + campaign filter tabs (Semua | Active | Paused | Ended) + campaign cards dengan status/platform badges + action buttons + approved videos table + pending submissions section
- **Analytics** (`/brand/analytics/page.tsx`): Budget progress bar + 4 stat cards (Views, Spent, CPM Effective/Original, Submissions) + Statistik section dengan platform tabs + Total/Kenaikan toggle + 4 sub-stats + Platform Distribution horizontal bars + Submission Status counts + Budget Efficiency comparison + Approved Videos table
- **Campaign Detail** (`/brand/campaigns/[id]/page.tsx`): Hero banner dengan category/status badges + 3 tabs (Detail | Submission | Analytic) + About Campaign + Brief/Material cards + Budget Info + Top 10 Clip ranking + Submission tab (approved/pending/rejected counts + list dengan approve/reject) + Analytic tab (stats grid)

#### Server Actions Extended
- `src/actions/campaign.actions.ts` — `getBrandOverview()` sekarang return `needToReview`, `totalSubmissions`, `campaignCards[]`, `approvedVideos[]`; `getBrandCampaignById()` return `brand`, `videoUrl`, `platformLink`, `submittedAt`, `estimatedPayout` per submission
- `src/actions/analytics.actions.ts` — return `budgetPercent`, `remaining`, `spent`, `totalSubmissions`, `cpmEffective`, `cpmOriginal`, `statusCounts`, `platformDistribution[]`, `approvedVideos[]`
- `src/actions/profile.actions.ts` — `getBrandProfile()` + `updateBrandProfile()` + `updateProfileImage()` dengan `revalidatePath`

#### Sidebar Update
- `src/components/dashboard/sidebar.tsx` — Tambah navigasi Budget/Wallet + Settings/User untuk BRAND + section "Campaign Saya" (fetch brand's active campaigns) + section "Butuh Bantuan?" (Hubungi Admin WhatsApp, FaQ & Peraturan)
- `src/lib/constants.ts` — `SIDEBAR_LINKS` diperluas dengan budget + settings links untuk BRAND

#### i18n
- `messages/id.json` + `messages/en.json` — ~185 baris baru per file
  - `BrandBudget`: 22 keys (balance, refund, history, tabs)
  - `BrandSettings`: 19 keys (profile, security, company name, industry, save)
  - `Brand`: 20+ keys (welcome, stats, review, cta, filters, cards, approved videos)
  - `BrandAnalytics`: 20+ keys (budget stats, platform tabs, distribution, efficiency)
  - `BrandCampaignDetail`: 15+ keys (tabs, about, brief, material, budget info, top clip)
  - `Sidebar`: 5 keys (budget, settings, campaignSaya, helpSection, draftCount)

### Changed Files
- `messages/en.json` — +185 lines
- `messages/id.json` — +185 lines
- `prisma/schema.prisma` — +15 lines (Industry enum + brand fields)
- `prisma/seed.ts` — +36 lines (brand seed data)
- `prisma/migrations/20260621194900_add_brand_fields/migration.sql` (NEW)
- `src/actions/analytics.actions.ts` — +71 lines
- `src/actions/budget.actions.ts` (NEW) — 42 lines
- `src/actions/campaign.actions.ts` — +71 lines
- `src/actions/profile.actions.ts` — +33 lines
- `src/app/[locale]/(auth)/register/page.tsx` — +52 lines
- `src/app/[locale]/(dashboard)/brand/analytics/page.tsx` — +300 lines
- `src/app/[locale]/(dashboard)/brand/budget/page.tsx` (NEW) — 280 lines
- `src/app/[locale]/(dashboard)/brand/campaigns/[id]/page.tsx` — +287 lines
- `src/app/[locale]/(dashboard)/brand/page.tsx` — +289 lines
- `src/app/[locale]/(dashboard)/brand/settings/page.tsx` (NEW) — 280 lines
- `src/app/api/auth/register/route.ts` — +8 lines
- `src/components/dashboard/sidebar.tsx` — +94 lines
- `src/lib/constants.ts` — +4 lines
- `src/lib/validations.ts` — +2 lines

---

## [0.1.5] - 2026-06-21

### Testing & Error Handling (Fase 0.4)

#### Error Boundaries — Next.js App Router Convention
- `src/app/[locale]/error.tsx` — root error boundary untuk seluruh public pages (campaigns, leaderboard, homepage)
- `src/app/[locale]/loading.tsx` — root loading spinner
- `src/app/[locale]/not-found.tsx` — root 404 page (FileQuestion icon + "Kembali ke Beranda")
- `src/app/[locale]/(dashboard)/error.tsx` — cascade ke seluruh dashboard (admin/brand/agency/creator + sub-routes)
- `src/app/[locale]/(dashboard)/loading.tsx` — skeleton loader: stat cards + table rows animasi pulse
- `src/app/[locale]/(auth)/error.tsx` — error boundary untuk login/register/verify

#### Unit Testing — Vitest + Testing Library
- `vitest` v4 dengan jsdom environment, `@testing-library/react` + `@testing-library/jest-dom`
- `vitest.config.ts` — path alias `@/` → `./src/*`, globals mode, setup file
- `src/test/setup.ts` — `@testing-library/jest-dom/vitest` matchers
- **4 test suites, 60 test cases, 100% pass**:
  - `src/test/auth.test.ts` (13 tests) — `getUserRole()`, `getSessionUser()`: null safety, edge cases (missing id/role/user)
  - `src/test/validations.test.ts` (22 tests) — 6 Zod schemas: login, register, campaign, submission, payout, connectSocial — valid/invalid/boundary/refinement
  - `src/test/rate-limit.test.ts` (11 tests) — `checkRateLimit()`: rate window, remaining count, multi-key isolation, per-config limits (auth/api/upload/webhook)
  - `src/test/env.test.ts` (14 tests) — env schema: valid config, optional fields, MIDTRANS_IS_PRODUCTION default, missing vars, invalid formats

#### Config
- `package.json` — `test` script (`vitest run`), `test:watch` script (`vitest`)
- `vitest.config.ts` — resolve alias `@/` + jsdom environment + globals
- Mock strategy: `vi.mock()` untuk chain next-auth (`next-auth`, `next-auth/providers/*`, `@auth/prisma-adapter`, `@/lib/prisma`, `bcryptjs`) agar test auth helpers tanpa dependency server-side

---

## [0.1.6] - 2026-06-21

### UI/UX Polish — Responsive, Accessibility, & Contrast (Fase 0.5)

#### Responsive Design
- **Sidebar**: mobile overlay (`fixed inset-0 z-40 lg:hidden`) dengan backdrop blur + click-to-close, desktop sidebar tetap `hidden lg:flex`. Accepts `mobileOpen`/`onCloseMobile` props.
- **Navbar**: hamburger button (`Menu` icon) visible `lg:hidden`, calls `onToggleSidebar` prop
- **Layout**: `sidebarMobileOpen` state untuk toggle mobile sidebar, `h-screen` → `min-h-screen` agar scrollable di mobile
- Loading spinner: `h-screen` → `min-h-screen` consistency

#### Accessibility (WCAG 2.1 AA)
- **Navbar**: `aria-label` di hamburger button (`"Open navigation menu"`), search input, notification bell (`aria-expanded` + `aria-haspopup`)
- **Notification dropdown**: `role="dialog"` + `aria-label`
- **Sidebar**: `aria-label` di collapse/expand toggle, close button (mobile)
- **Brand dashboard**: `aria-label` di approve (`CheckCircle`), reject (`XCircle`) icon buttons
- **LocaleSwitcher**: `title` → `aria-label` untuk screen reader compatibility
- **Mark all read**: `aria-label` di notification action

#### Color Contrast (WCAG AA)
- Global `text-[#8888aa]` → `text-[#a0a0c0]` di **28 files** (~157 occurrences)
  - `#a0a0c0` pada `#0a0a1a` background mencapai 4.53:1 (passes AA 4.5:1)
  - Auth pages (login, register, verify, error)
  - Dashboard pages (admin, brand, creator, agency — all sub-routes)
  - Shared components (error-boundary, locale-switcher)
  - Public pages (campaigns, leaderboard, landing)
  - Error/loading/not-found pages

#### Animation Consistency
- **Landing page** (`[locale]/page.tsx`):
  - y-offset standardized: `y: 40` → `y: 30` (stats), `y: 20` → `y: 30` (FAQ)
  - Duration standardized: `0.6` → `0.5` (hero, CTA)
  - All motion.divs now uniform: `y: 30`, `duration: 0.5`

### Changed Files
- `src/components/dashboard/sidebar.tsx` — refactored: `SidebarContent` inner + overlay wrapper
- `src/components/dashboard/navbar.tsx` — hamburger button, aria-* attributes, `onToggleSidebar` prop
- `src/app/[locale]/(dashboard)/layout.tsx` — `sidebarMobileOpen` state, wirings, `h-screen`→`min-h-screen`
- `src/app/[locale]/page.tsx` — animation consistency + contrast
- `src/components/shared/locale-switcher.tsx` — `title`→`aria-label`
- **28 files**: global `text-[#8888aa]`→`text-[#a0a0c0]` contrast fix
- `src/app/[locale]/(dashboard)/brand/page.tsx` — aria-labels on icon buttons

---

## [0.1.4] - 2026-06-21

### i18n — Internationalization (Fase 0.3)

#### next-intl Integration
- `next-intl` v4 dengan `localePrefix: "as-needed"` (default: `id`)
- 2 locale: Bahasa Indonesia (`id`) + English (`en`)
- `src/i18n/routing.ts` — routing config (`defineRouting`)
- `src/i18n/request.ts` — message loader (`getRequestConfig`)
- `src/i18n/navigation.ts` — `Link`, `useRouter`, `usePathname` wrappers (`createNavigation`)
- `src/components/shared/locale-switcher.tsx` — tombol toggle ID/EN di navbar

#### [locale] Route Group Migration
- Seluruh 23 halaman dipindahkan ke `src/app/[locale]/`
- Root `src/app/layout.tsx` dipertahankan (wrapper `<html>` / `<body>`)
- `src/app/[locale]/layout.tsx` — wrapping `NextIntlClientProvider` + `SessionProvider` + `ThemeProvider`
- Semua halaman menggunakan `useTranslations()` dan `@/i18n/navigation`

#### Translation Messages
- `messages/id.json` — 491 baris translasi Bahasa Indonesia
- `messages/en.json` — 491 baris translasi English
- Mencakup: Common, Navbar, Sidebar, Auth, Landing, Dashboard (Admin/Brand/Creator/Agency), Campaigns, Leaderboard, Wallet

#### Middleware Refactor
- Middleware digabung: `createMiddleware(routing)` dari next-intl + custom auth/RBAC logic
- Pathname parsing locale-aware: deteksi locale prefix sebelum routing decision

#### Component Updates
- `Navbar` — greeting + notifications pakai `useTranslations`, date-fns locale-aware, locale switcher
- `Sidebar` — navigasi pakai `Link` dari `@/i18n/navigation`, `useTranslations` untuk label

#### Config
- `next.config.ts` — tambah `createNextIntlPlugin("./src/i18n/request.ts")` + wrap export dengan `withNextIntl()`

---

## [0.1.2] - 2026-06-21

### Security — Hardening (Fase 0.2 Stabilisasi)

#### Auth & Authorization
- `getUserRole(session)` helper di `src/lib/auth.ts` — centralized role extraction, ganti pola `(session?.user as any)?.role` di middleware
- `simulateViewTracking()` di `src/actions/tracking.actions.ts` — tambah auth check, hanya ADMIN yang bisa trigger tracking simulasi
- `updateUserRole()` di `src/actions/admin.actions.ts` — validasi role terhadap Prisma Role enum (`VALID_ROLES = ["BRAND", "CREATOR", "AGENCY", "ADMIN"]`), reject invalid role sebelum query DB

#### Input Validation Hardening
- `reviewSubmission()` di `src/actions/submission.actions.ts` — runtime status validation (`VALID_SUBMISSION_STATUSES`), ganti `status: "APPROVED" | "REJECTED"` → `status: string` + guard untuk mencegah type confusion
- Zod schemas di `src/lib/validations.ts`:
  - `campaignSchema`: max length di title (200), description (2000), deliverables (max 10 items)
  - `submissionSchema`: `.refine` — minimal salah satu dari `videoUrl` atau `platformLink` harus diisi
  - `payoutSchema`: max amount (100000000), max accountInfo (100)
  - `registerSchema`: referral code regex `^[A-Z0-9]*$` — mencegah injection
  - `connectSocialSchema`: max username (100)

#### Security Headers (`next.config.ts`)
- Content-Security-Policy (CSP) — default-src 'self', script-src include `unsafe-eval` (Midtrans Snap SDK) + `unsafe-inline`, connect-src include Midtrans API + OpenAI API + Google OAuth
- Strict-Transport-Security (HSTS) — max-age=31536000, includeSubDomains
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera/microphone/geolocation none

#### Rate Limiting
- `src/lib/rate-limit.ts` (NEW) — in-memory rate limiter dengan Map, 4 tier konfigurasi: auth (5 req/60s), api (30 req/60s), upload (5 req/60s), webhook (60 req/60s)
- Auto-cleanup expired entries via `setInterval().unref()` setiap 60 detik
- Applied di `upload/route.ts` dan `midtrans/notification/route.ts`

#### Environment Validation
- `src/lib/env.ts` (NEW) — Zod schema untuk validasi semua env vars di startup (`getEnv()`): DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OPENAI_API_KEY, MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY, RESEND_API_KEY, EMAIL_FROM

#### Info Leak Prevention
- `src/app/api/upload/route.ts`: fix `console.error` — hanya log `error.message`, bukan error object utuh
- `src/app/api/midtrans/notification/route.ts`: fix `console.error` — hanya log `error.message`
- `src/lib/email.ts`: guard `console.log` dengan `NODE_ENV === "development"`

### Fixed
- `middleware.ts`: type error `Type 'null' cannot be used as an index type` di `redirectMap[role]` — fix dengan `role ?? ""`

### Changed
- `next.config.ts`: `eslint.ignoreDuringBuilds` dari `true` → `false` (lint dijalankan saat build)

---

## [0.1.3] - 2026-06-21

### Refactored — Type Safety (Fase 0.2 Stabilisasi lanjutan)

#### Auth Helper Centralization
- `getSessionUser(session)` di `src/lib/auth.ts` — satu helper terpusat yang return `{ id: string | null, role: string | null }`, ganti seluruh pola `(session?.user as any)` di 13 server action files
- Pattern konsisten: `const { id: userId, role } = getSessionUser(session)` → gunakan `userId` / `role` langsung
- File yang diupdate:
  - `admin.actions.ts` — 7 fungsi (getAdminStats, getAllUsers, updateUserRole, approveCampaign, rejectCampaign, getAllPayouts, processPayout)
  - `agency.actions.ts` — 3 fungsi (getAgencyStats, getAgencyMembers, generateInviteLink)
  - `ai.actions.ts` — batchScoreSubmissions
  - `analytics.actions.ts` — getBrandAnalytics
  - `auth.actions.ts` — 3 fungsi (connectSocial, getSocialAccounts, joinCampaign)
  - `campaign.actions.ts` — 4 fungsi (createCampaign, getBrandCampaigns, getBrandCampaignById, getBrandOverview)
  - `creator.actions.ts` — 3 fungsi (getCreatorStats, getCreatorSubmissions, getCreatorEarnings)
  - `notification.actions.ts` — 3 fungsi (getNotifications, getUnreadCount, markAllAsRead)
  - `payout.actions.ts` — 2 fungsi (requestPayout, getPayoutHistory)
  - `profile.actions.ts` — 2 fungsi (updateProfile, uploadAvatar)
  - `submission.actions.ts` — 3 fungsi (submitVideo, getCreatorSubmissions, reviewSubmission)
  - `transaction.actions.ts` — 2 fungsi (createTopUp, getTransactionHistory)
  - `tracking.actions.ts` — simulateViewTracking
- Null-safe guard: `session?.user?.name ?? "Creator"` di `submission.actions.ts`, `session?.user?.name/email || "..."` di `transaction.actions.ts`
- Fix parameter shadowing: `updateUserRole(userId, role)` → `updateUserRole(targetUserId, targetRole)` + destructure rename `adminUserId` / `adminRole`

---

## [0.1.1] - 2026-06-21

### Added
- `.gitignore` — melindungi `.env`, `.env.local`, `node_modules/`, `.next/` dan file build/system lainnya
- `README.md` — dokumentasi setup, environment variables, struktur project, dan seed accounts
- `docs/ARSITEKTUR.md` — dokumentasi arsitektur lengkap (system overview, database ERD, auth flow, middleware RBAC, data flow, component architecture)

### Security
- Kredensial Google OAuth asli dipindahkan dari `.env` → `.env.local` (tidak lagi tercommit ke repository)

### Fixed
- Midtrans Snap JS SDK sekarang di-load di root layout via `<Script>` — top-up wallet siap digunakan di production dan sandbox
- Fallback message top-up diperbaiki dari "siap digunakan saat production" menjadi "sedang dimuat, silakan coba lagi"

### DevOps
- Repository di-push ke GitHub: https://github.com/gmrfx2026/gudangklip
- 2 commits awal: initial commit (72 files) + README & Midtrans fix

---

## [0.1.0] - 2026-06-21

### Initial Release

#### Authentication & Authorization
- NextAuth v5 dengan Google OAuth + Credentials (email/password)
- JWT session strategy dengan role-based token enrichment
- Middleware RBAC untuk 4 role (Brand, Creator, Agency, Admin)
- Registrasi user dengan referral code + verifikasi email via Resend
- Role redirection: user login diarahkan ke dashboard sesuai role

#### Landing Page (`/`)
- Hero section dengan CTA
- How it works (4 steps)
- Hot campaigns showcase
- Why choose us
- Creator testimonials
- FAQ accordion
- CTA section
- Footer dengan social links

#### Public Pages
- `/campaigns` — browsing campaign aktif dengan search dan filter kategori
- `/leaderboard` — top 20 creators berdasarkan total earning

#### Creator Dashboard (`/creator/*`)
- **Overview**: balance, total views, trust score, active campaigns count, total earnings
- **Explore**: daftar campaign aktif yang bisa di-join
- **My Campaigns**: campaign yang sudah di-join creator
- **Submissions**: upload video + link platform, lihat history submission dengan status
- **Wallet**: lihat balance, top-up via Midtrans Snap, request withdraw, history transaksi & payout
- **Profile**: upload foto profil, connect social account (TikTok/Instagram/YouTube)

#### Brand Dashboard (`/brand/*`)
- **Overview**: statistik brand + grid submission untuk direview
- **Campaigns**: list campaign milik brand
- **New Campaign**: form create campaign (judul, deskripsi, budget, CPM, durasi, kategori)
- **Campaign Detail**: detail campaign + review submission (approve/reject dengan notes)
- **Analytics**: reach, engagement rate, cost-per-view, ROI, grafik performa

#### Agency Dashboard (`/agency/*`)
- **Overview**: jumlah members, total earning members, komisi agency
- **Members**: daftar creator di bawah agency + invite link generasi

#### Admin Dashboard (`/admin/*`)
- **Overview**: statistik platform global (users, campaigns, submissions, views)
- **Users Management**: list semua user + edit role (dropdown per user)
- **Payouts Management**: list payout + process/complete/fail actions

#### Campaign System
- CRUD campaign lengkap (brand)
- Join campaign (creator)
- Budget management (remaining budget auto-deduct)
- Status lifecycle: DRAFT → ACTIVE → PAUSED → ENDED
- Submissions: PENDING → APPROVED/REJECTED

#### AI Scoring
- Integrasi OpenAI GPT-4o-mini untuk menilai kualitas submission
- Scoring otomatis saat creator submit video

#### View Tracking
- Simulasi view tracking harian dengan bot detection algorithm
- Filter bot activity untuk mencegah manipulasi
- Auto-calculation payout berdasarkan CPM

#### Payment Integration (Midtrans)
- Midtrans Snap untuk top-up wallet
- Midtrans Core API untuk backend transaction
- Webhook handler `/api/midtrans/notification` dengan SHA512 signature verification
- Transaction lifecycle: PENDING → SUCCESS/FAILED

#### Payout System
- Creator request withdraw (min Rp 50.000)
- Admin process/complete/fail payout
- Payout lifecycle: PENDING → PROCESSING → COMPLETED/FAILED
- Email notification via Resend saat payout completed

#### Notification System
- In-app notifications (real-time badge count di navbar)
- Mark as read / mark all read
- Notification dropdown di navbar

#### File Upload
- API route `/api/upload` — menerima image & video (max 50MB)
- Digunakan untuk profile image upload

#### Referral System
- Setiap user dapat generate referral code
- Creator yang join via referral otomatis masuk ke agency referrer
- Commission rate untuk agency (default 10%)

#### Database (Prisma + PostgreSQL 16)
- 16 models: User, Account, Session, VerificationToken, SocialAccount, Campaign, CampaignAsset, CampaignParticipant, Submission, ViewLog, Payout, Agency, Notification, Transaction
- 7 enums: Role, Platform, Category, CampaignStatus, SubmissionStatus, PayoutStatus, ParticipantStatus
- Migration files ready
- Seed script: 1 admin, 2 brands, 1 agency, 10 creators, 5 campaigns dengan submissions & view logs

#### UI/UX
- Dark theme exclusive (purple/blue color scheme)
- Tailwind CSS v4 utility classes
- Radix UI components (Dialog, DropdownMenu, Select, Tabs, Avatar)
- Framer Motion animations
- Recharts untuk grafik (analytics dashboard)
- Responsive design (mobile + desktop)
- Sidebar collapse/expand
- Toast notifications via Sonner
- Loading states dengan spinner (Loader2)

#### DevOps
- Docker Compose untuk PostgreSQL 16 local development
- Next.js standalone output mode
- Path aliases `@/` → `./src/*`
