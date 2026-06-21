# Changelog

Semua perubahan penting pada project GudangKlip dicatat di sini.

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
