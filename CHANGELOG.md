# Changelog

Semua perubahan penting pada project GudangKlip dicatat di sini.

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
