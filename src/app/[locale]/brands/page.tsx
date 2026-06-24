"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Wallet,
  BarChart3,
  Shield,
  Eye,
  Zap,
  UserCheck,
  CheckCircle,
  ChevronRight,
  Play,
  Building2,
  Globe,
} from "lucide-react";

export default function BrandLandingPage() {
  const t = useTranslations("BrandLanding");
  const tLanding = useTranslations("Landing");

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
              {tLanding("navCampaigns")}
            </Link>
            <Link href="/login" className="text-sm text-[#b8b8d0] hover:text-white transition-colors">
              {tLanding("navLogin")}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              {t("ctaStart")}
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
                <Building2 className="h-4 w-4 text-[#f59e0b]" />
                <span className="text-[#b8b8d0]">{t("badge")}</span>
              </div>
              <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
                {t("heroTitle")}<br />
                <span className="gradient-text">{t("heroTitleHighlight")}</span>
              </h1>
              <p className="mb-8 text-lg text-[#b8b8d0]">
                {t("heroSubtitle")}
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-8 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-opacity glow-sm"
                >
                  {t("ctaStart")}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-[#2a2a50] px-8 py-3.5 text-base font-medium text-[#e8e8f0] hover:bg-[#111128] transition-colors"
                >
                  <Play className="h-4 w-4" />
                  {t("ctaExplore")}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Demo Dashboard */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">{t("liveStats")}</h2>
            <p className="text-[#b8b8d0]">{t("liveStatsSub")}</p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-3xl border border-[#2a2a50] bg-[#111128]/80 backdrop-blur"
          >
            {/* Dashboard Header */}
            <div className="border-b border-[#2a2a50] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff]/20 to-[#3b82f6]/20">
                  <BarChart3 className="h-5 w-5 text-[#6c63ff]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t("liveDashboardTitle")}</h3>
                  <p className="text-xs text-[#a0a0c0]">{t("liveDashboardSub")}</p>
                </div>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-px bg-[#2a2a50] md:grid-cols-4">
              {[
                { value: "2.4M", label: t("liveViews"), icon: <Eye className="h-5 w-5" />, trend: "+12.5%" },
                { value: "847", label: t("liveCreators"), icon: <Users className="h-5 w-5" />, trend: "+5.2%" },
                { value: "Rp 1.2M", label: t("liveBudget"), icon: <Wallet className="h-5 w-5" />, trend: "65% used" },
                { value: "4.2x", label: t("liveROI"), icon: <TrendingUp className="h-5 w-5" />, trend: "+0.8x" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0d0d22] p-6">
                  <div className="mb-3 flex items-center gap-2 text-[#6c63ff]">{stat.icon}</div>
                  <div className="mb-1 text-2xl font-bold text-white">{stat.value}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0a0c0]">{stat.label}</span>
                    <span className="text-xs font-medium text-[#10b981]">{stat.trend}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Chart Placeholder */}
            <div className="p-6">
              <div className="flex items-end gap-1 h-32">
                {[35, 45, 30, 60, 55, 75, 50, 65, 80, 70, 85, 95, 75, 65, 50, 60, 70, 80, 90, 100, 85, 70, 55, 40].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-[#6c63ff]/30 to-[#3b82f6]/30"
                      style={{ height: `${h}%` }}
                    />
                  )
                )}
              </div>
              <div className="mt-3 flex justify-between text-xs text-[#6b7280]">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>Now</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">{t("whyTitle")}</h2>
            <p className="text-[#b8b8d0]">{t("whySub")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: <UserCheck className="h-6 w-6" />, title: t("why1Title"), desc: t("why1Desc") },
              { icon: <Shield className="h-6 w-6" />, title: t("why2Title"), desc: t("why2Desc") },
              { icon: <Zap className="h-6 w-6" />, title: t("why3Title"), desc: t("why3Desc") },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff]/20 to-[#3b82f6]/20 text-[#6c63ff]">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-[#a0a0c0]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">{t("howTitle")}</h2>
            <p className="text-[#b8b8d0]">{t("howSub")}</p>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px bg-gradient-to-b from-[#6c63ff]/50 to-transparent md:block" />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "1", title: t("step1Title"), desc: t("step1Desc"), icon: <Globe className="h-6 w-6" /> },
                { step: "2", title: t("step2Title"), desc: t("step2Desc"), icon: <Users className="h-6 w-6" /> },
                { step: "3", title: t("step3Title"), desc: t("step3Desc"), icon: <CheckCircle className="h-6 w-6" /> },
                { step: "4", title: t("step4Title"), desc: t("step4Desc"), icon: <Wallet className="h-6 w-6" /> },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
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
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">{t("faqTitle")}</h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (n - 1) * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6"
              >
                <h3 className="mb-2 font-semibold text-white">{t(`faq${n}Q`)}</h3>
                <p className="text-sm text-[#a0a0c0]">{t(`faq${n}A`)}</p>
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
            <h2 className="relative mb-4 text-3xl font-bold text-white">{t("ctaTitle")}</h2>
            <p className="relative mb-8 text-white/80">{t("ctaSub")}</p>
            <Link
              href="/register"
              className="relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-[#6c63ff] hover:bg-gray-100 transition-colors"
            >
              {t("ctaButton")} <ArrowRight className="h-5 w-5" />
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
                {tLanding("footerTagline")}
              </p>
            </div>
            <div className="flex gap-8 text-sm text-[#a0a0c0]">
              <Link href="/campaigns" className="hover:text-white transition-colors">{tLanding("navCampaigns")}</Link>
              <Link href="/leaderboard" className="hover:text-white transition-colors">{tLanding("navLeaderboard")}</Link>
              <Link href="#" className="hover:text-white transition-colors">{tLanding("footerPrivacy")}</Link>
              <Link href="#" className="hover:text-white transition-colors">{tLanding("footerTerms")}</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-[#2a2a50]/50 pt-8 text-center text-sm text-[#a0a0c0]">
            &copy; {new Date().getFullYear()} {tLanding("footerRights")}
          </div>
        </div>
      </footer>
    </div>
  );
}
