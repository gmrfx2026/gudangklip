"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { RoleDialog } from "@/components/landing/role-dialog";
import { LivePayoutFeed } from "@/components/landing/live-payout-feed";
import { RevenueCalculator } from "@/components/landing/revenue-calculator";
import { PaymentCycle } from "@/components/landing/payment-cycle";
import {
  ArrowRight,
  TrendingUp,
  Wallet,
  Shield,
  Zap,
  CheckCircle,
  Star,
  ChevronRight,
  Play,
  Users,
  BarChart3,
  DollarSign,
  Building2,
  User,
} from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function LandingPage() {
  const t = useTranslations("Landing");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-[#2a2a50]/50 bg-[#0a0a1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-sm font-bold text-white">
              G
            </div>
            <span className="text-lg font-bold text-white">
              Gudang<span className="gradient-text">Klip</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/campaigns" className="text-sm text-[#b8b8d0] hover:text-white transition-colors">
              {t("navCampaigns")}
            </Link>
            <Link href="/leaderboard" className="text-sm text-[#b8b8d0] hover:text-white transition-colors">
              {t("navLeaderboard")}
            </Link>
            <Link href="/login" className="text-sm text-[#b8b8d0] hover:text-white transition-colors">
              {t("navLogin")}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              {t("navRegister")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#6c63ff]/10 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#3b82f6]/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2a2a50] bg-[#111128]/80 px-4 py-1.5 text-sm backdrop-blur">
                <Zap className="h-4 w-4 text-[#f59e0b]" />
                <span className="text-[#b8b8d0]">{t("badge")}</span>
              </div>
              <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
                {t("heroLine1")}<br />
                <span className="gradient-text">{t("heroLine2")}</span> {t("heroLine2Suffix")}
              </h1>
              <p className="mb-8 text-lg text-[#b8b8d0]">
                {t("heroSubtitle")}
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-8 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-opacity glow-sm"
                >
                  <User className="h-5 w-5" />
                  {t("ctaStart")}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/campaigns"
                  className="inline-flex items-center gap-2 rounded-full border border-[#2a2a50] px-8 py-3.5 text-base font-medium text-[#e8e8f0] hover:bg-[#111128] transition-colors"
                >
                  <Play className="h-4 w-4" />
                  {t("ctaExplore")}
                </Link>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setRoleDialogOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#2a2a50]/50 bg-[#111128]/50 px-5 py-2 text-sm font-medium text-[#b8b8d0] hover:border-[#6c63ff]/50 hover:text-white transition-all backdrop-blur"
                >
                  <Building2 className="h-4 w-4" />
                  {t("createCampaignBtn")}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0,               y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4"
            >
              {[
                { value: t("statBudgetValue"), label: t("statBudget") },
                { value: t("statCreatorsValue"), label: t("statCreators") },
                { value: t("statBrandsValue"), label: t("statBrands") },
                { value: t("statPayoutValue"), label: t("statPayout") },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-4 backdrop-blur">
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-[#a0a0c0]">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Live Payout + Calculator */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <LivePayoutFeed />
            <RevenueCalculator />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              {t("howItWorks")}
            </h2>
            <p className="text-[#b8b8d0]">{t("howItWorksSub")}</p>
          </div>
          {/* Platform icons */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
            <span className="text-sm text-[#a0a0c0]">{t("howItWorksPlatforms")}:</span>
            <div className="flex items-center gap-3">
              {[
                { name: t("platformTikTok"), icon: TikTokIcon, connected: true },
                { name: t("platformInstagram"), icon: InstagramIcon, connected: true },
                { name: t("platformYouTube"), icon: YouTubeIcon, connected: true },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-1.5 rounded-full border border-[#2a2a50] bg-[#111128]/60 px-3 py-1.5 text-xs backdrop-blur"
                >
                  <p.icon className="h-4 w-4" />
                  <span className="text-[#b8b8d0]">{p.name}</span>
                  {p.connected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: t("step1Title"),
                desc: t("step1Desc"),
                icon: <Users className="h-6 w-6" />,
              },
              {
                step: "2",
                title: t("step2Title"),
                desc: t("step2Desc"),
                icon: <Play className="h-6 w-6" />,
              },
              {
                step: "3",
                title: t("step3Title"),
                desc: t("step3Desc"),
                icon: <Wallet className="h-6 w-6" />,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-8 hover:border-[#6c63ff]/50 transition-all duration-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff]/20 to-[#3b82f6]/20 text-[#6c63ff]">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  <span className="gradient-text mr-2">{item.step}.</span>
                  {item.title}
                </h3>
                <p className="text-sm text-[#a0a0c0]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-white">{t("hotCampaigns")}</h2>
              <p className="text-[#b8b8d0]">{t("hotCampaignsSub")}</p>
            </div>
            <Link
              href="/campaigns"
              className="hidden items-center gap-1 text-sm font-medium text-[#6c63ff] hover:underline md:flex"
            >
              {t("viewAll")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Budget Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-[#6c63ff]/20 bg-gradient-to-r from-[#6c63ff]/10 to-[#3b82f6]/10 p-4"
          >
            <DollarSign className="h-5 w-5 text-[#6c63ff]" />
            <span className="text-sm text-[#b8b8d0]">{t("hotCampaignsBudget")}:</span>
            <span className="text-lg font-bold gradient-text">Rp 500.000.000</span>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CAMPAIGNS.map((campaign, i) => (
              <motion.div
                key={campaign.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl border border-[#2a2a50] bg-[#111128]/50 hover:border-[#6c63ff]/50 transition-all duration-300"
              >
                <div className="aspect-video bg-gradient-to-br from-[#1e1e3f] to-[#0f0f23] flex items-center justify-center">
                  <span className="text-4xl">{campaign.icon}</span>
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#6c63ff]/10 px-2.5 py-0.5 text-xs font-medium text-[#6c63ff]">
                      {t(`Category.${campaign.category}` as any)}
                    </span>
                    <span className="rounded-full bg-[#10b981]/10 px-2.5 py-0.5 text-xs font-medium text-[#10b981]">
                      {t("active")}
                    </span>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-white">{campaign.title}</h3>
                  <div className="mb-4 flex items-center gap-2 text-sm text-[#a0a0c0]">
                    <DollarSign className="h-4 w-4" />
                    <span>Rp {campaign.cpm.toLocaleString()} /1K views</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#a0a0c0]">{campaign.creators} {t("creators")}</span>
                    <span className="font-medium text-[#10b981]">{campaign.progress}% {t("progressSuffix")}</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-[#1a1a35]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]"
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PaymentCycle />

      {/* Why Us */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">{t("whyUs")}</h2>
            <p className="text-[#b8b8d0]">{t("whyUsSub")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <BarChart3 className="h-6 w-6" />, title: t("why1Title"), desc: t("why1Desc") },
              { icon: <TrendingUp className="h-6 w-6" />, title: t("why2Title"), desc: t("why2Desc") },
              { icon: <Shield className="h-6 w-6" />, title: t("why3Title"), desc: t("why3Desc") },
              { icon: <CheckCircle className="h-6 w-6" />, title: t("why4Title"), desc: t("why4Desc") },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#6c63ff]/20 to-[#3b82f6]/20 text-[#6c63ff]">
                  {item.icon}
                </div>
                <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-[#a0a0c0]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">{t("testimonials")}</h2>
            <p className="text-[#b8b8d0]">{t("testimonialsSub")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Al Fatan", income: "Rp 51 Juta", quote: "Awalnya nyoba nyoba, kirain sekkem, ternyata cair beneran wkwkwkw" },
              { name: "Dika", income: "Rp 62 Juta", quote: "Nggak nyangka satu campaign bisa segini hasilnya. Platform paling fair." },
              { name: "Teja", income: "Rp 27 Juta", quote: "Komunitas kreatornya solid. Brand yang masuk juga terpercaya." },
            ].map((t_item, i) => (
              <motion.div
                key={t_item.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-[#b8b8d0]">&ldquo;{t_item.quote}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{t_item.name}</span>
                  <span className="text-sm font-bold text-[#10b981]">{t_item.income}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">{t("faq")}</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: t("faq1Q"), a: t("faq1A") },
              { q: t("faq2Q"), a: t("faq2A") },
              { q: t("faq3Q"), a: t("faq3A") },
              { q: t("faq4Q"), a: t("faq4A") },
              { q: t("faq5Q"), a: t("faq5A") },
            ].map((faq_item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6"
              >
                <h3 className="mb-2 font-semibold text-white">{faq_item.q}</h3>
                <p className="text-sm text-[#a0a0c0]">{faq_item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] p-12 text-center"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0tMTIgMGMxLjY1NyAwIDMtMS4zNDMgMy0zcy0xLjM0My0zLTMtMy0zIDEuMzQzLTMgMyAxLjM0MyAzIDMgM3ptMjQgMjRjMS42NTcgMCAzLTEuMzQzIDMtM3MtMS4zNDMtMy0zLTMtMyAxLjM0My0zIDMgMS4zNDMgMyAzIDN6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            <h2 className="relative mb-4 text-3xl font-bold text-white">{t("ctaBottom")}</h2>
            <p className="relative mb-8 text-white/80">{t("ctaBottomSub")}</p>
            <Link
              href="/register"
              className="relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-[#6c63ff] hover:bg-gray-100 transition-colors"
            >
              {t("ctaBottomButton")} <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a50] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-sm font-bold text-white">
                  G
                </div>
                <span className="text-lg font-bold text-white">
                  Gudang<span className="gradient-text">Klip</span>
                </span>
              </Link>
              <p className="mt-2 text-sm text-[#a0a0c0]">
                {t("footerTagline")}
              </p>
            </div>
            <div className="flex gap-8 text-sm text-[#a0a0c0]">
              <Link href="/campaigns" className="hover:text-white transition-colors">{t("navCampaigns")}</Link>
              <Link href="/leaderboard" className="hover:text-white transition-colors">{t("navLeaderboard")}</Link>
              <Link href="#" className="hover:text-white transition-colors">{t("footerPrivacy")}</Link>
              <Link href="#" className="hover:text-white transition-colors">{t("footerTerms")}</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-[#2a2a50]/50 pt-8 text-center text-sm text-[#a0a0c0]">
            &copy; {new Date().getFullYear()} {t("footerRights")}
          </div>
        </div>
      </footer>

      <RoleDialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} />
    </div>
  );
}

const CAMPAIGNS = [
  { icon: "\uD83C\uDFB5", category: "MUSIC", title: "Adiw - Untuk Apa Kucintai", cpm: 3000, creators: 142, progress: 68 },
  { icon: "\uD83C\uDFAC", category: "FILM", title: "Jangan Buang Ibu - Official", cpm: 500, creators: 352, progress: 45 },
  { icon: "\uD83C\uDFAD", category: "ENTERTAINMENT", title: "Ternakklip Interviews Eps. 5", cpm: 5000, creators: 243, progress: 82 },
  { icon: "\uD83D\uDCF1", category: "BRAND", title: "Nyemil Saji - Launch Campaign", cpm: 1000, creators: 76, progress: 30 },
  { icon: "\uD83C\uDFB6", category: "MUSIC", title: "Angga Elza - New Single", cpm: 2000, creators: 57, progress: 55 },
  { icon: "\uD83C\uDFAC", category: "FILM", title: "Tanah Runtuh - Gala Premier", cpm: 2500, creators: 123, progress: 20 },
];