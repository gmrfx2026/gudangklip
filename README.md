# GudangKlip

Marketplace kliping video — platform yang menghubungkan Brand dengan Content Creator untuk kampanye video pendek (TikTok, Instagram Reels, YouTube Shorts).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | NextAuth v5 (Google OAuth + Credentials) |
| Styling | Tailwind CSS v4 |
| UI | Radix UI + Framer Motion + Recharts |
| Payment | Midtrans |
| Email | Resend |
| AI | OpenAI GPT-4o-mini |

## Prerequisites

- Node.js 18+
- PostgreSQL 16 (atau Docker)
- npm

## Quick Start

```bash
# 1. Clone
git clone https://github.com/gmrfx2026/gudangklip.git
cd gudangklip

# 2. Install dependencies
npm install

# 3. Jalankan PostgreSQL (via Docker)
docker compose up -d

# 4. Setup environment
cp .env.example .env.local
# Isi .env.local dengan kredensial asli (Google OAuth, OpenAI, Midtrans, Resend)

# 5. Setup database
npx prisma migrate dev
npx prisma db seed

# 6. Run
npm run dev
```

Buka http://localhost:3000

## Environment Variables

Copy `.env.example` ke `.env.local` dan isi:

| Variable | Keterangan |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random string untuk JWT signing |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `OPENAI_API_KEY` | OpenAI API key (untuk AI scoring) |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key |
| `MIDTRANS_CLIENT_KEY` | Midtrans Client Key |
| `MIDTRANS_IS_PRODUCTION` | `false` untuk sandbox |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Email pengirim |

## Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed data awal (admin, brand, creator, campaign)
npm run db:seed

# Buka Prisma Studio
npm run db:studio
```

## Seed Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gudangklip.com | admin123 |
| Brand | brand1@gudangklip.com | brand123 |
| Brand | brand2@gudangklip.com | brand123 |
| Agency | agency@gudangklip.com | agency123 |
| Creator | creator1@gudangklip.com ... creator10 | creator123 |

## Project Structure

```
src/
  app/                   # Next.js App Router pages
    (auth)/              # Login, Register, Verify Email
    (dashboard)/         # Role-based dashboards
      admin/             # Admin: users, payouts, approvals
      brand/             # Brand: campaigns, analytics
      agency/            # Agency: members, overview
      creator/           # Creator: explore, submit, wallet
    api/                 # API routes (auth, upload, midtrans)
    campaigns/           # Public campaign browsing
    leaderboard/         # Public leaderboard
  components/            # Shared UI components
  actions/               # Server Actions (14 modules)
  lib/                   # Utilities (auth, prisma, midtrans, email)
  types/                 # TypeScript type definitions
  middleware.ts          # Auth middleware (role-based routing)
prisma/
  schema.prisma          # Database schema (16 models)
  migrations/            # Migration history
  seed.ts                # Seed data
```

## Features

- **4 Role Dashboard**: Brand, Creator, Agency, Admin
- **Campaign Management**: CRUD campaign, review submissions, approve/reject
- **AI Scoring**: OpenAI GPT-4o-mini untuk penilaian kualitas konten
- **Wallet & Payment**: Midtrans top-up dan withdraw
- **View Tracking**: Simulasi view dengan bot detection
- **Leaderboard**: Top creators berdasarkan earning
- **Agency System**: Multi-level referral dengan komisi
- **Notifications**: In-app + email (Resend)
- **Google OAuth**: Login dengan akun Google
