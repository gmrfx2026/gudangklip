"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Clock, ShieldCheck, Wallet } from "lucide-react";

export function PaymentCycle() {
  const t = useTranslations("Landing");

  const steps = [
    {
      icon: Clock,
      title: t("payStep1Title"),
      desc: t("payStep1Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("payStep2Title"),
      desc: t("payStep2Desc"),
    },
    {
      icon: Wallet,
      title: t("payStep3Title"),
      desc: t("payStep3Desc"),
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2a2a50] bg-[#111128]/80 px-4 py-1.5 text-sm text-[#b8b8d0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            {t("paymentBadge")}
          </span>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {t("paymentCycleTitle")}{" "}
            <span className="gradient-text">{t("paymentCycleHighlight")}</span>
          </h2>
          <p className="text-lg text-[#b8b8d0]">{t("paymentCycleSub")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="group relative rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-8 hover:border-[#6c63ff]/30 transition-all duration-300"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff]/20 to-[#3b82f6]/20 text-[#6c63ff] group-hover:scale-110 transition-transform">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="absolute right-4 top-4 text-4xl font-extrabold text-[#6c63ff]/10">
                {i + 1}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-[#a0a0c0] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6"
        >
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-[#b8b8d0]">{t("paymentProgressTitle")}</span>
            <span className="text-[#a0a0c0]">{t("paymentProgressHint")}</span>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between">
              {[
                { label: t("paymentProgressStep1"), icon: "\uD83D\uDCCA" },
                { label: t("paymentProgressStep2"), icon: "\uD83D\uDD0D" },
                { label: t("paymentProgressStep3"), icon: "\uD83D\uDCB0" },
              ].map((item, i) => (
                <div key={item.label} className="relative z-10 flex flex-col items-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#6c63ff] bg-[#6c63ff]/10 text-lg">
                    {item.icon}
                  </div>
                  <span className="text-xs text-[#a0a0c0] max-w-[80px] text-center">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Connector line */}
            <div className="absolute top-5 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-0.5 bg-[#2a2a50]">
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "60%" }}
                transition={{ duration: 1.5, delay: 0.8 }}
                viewport={{ once: true }}
                className="h-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
