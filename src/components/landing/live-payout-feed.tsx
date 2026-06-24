"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

const PAYOUTS = [
  { id: "#GK-8472", views: "120K", amount: 360000, secondsAgo: 120 },
  { id: "#GK-1843", views: "85K", amount: 255000, secondsAgo: 300 },
  { id: "#GK-9921", views: "210K", amount: 630000, secondsAgo: 480 },
  { id: "#GK-3347", views: "45K", amount: 135000, secondsAgo: 720 },
  { id: "#GK-7712", views: "156K", amount: 468000, secondsAgo: 900 },
  { id: "#GK-5089", views: "98K", amount: 294000, secondsAgo: 1080 },
];

function fmtTimeAgo(seconds: number, t: ReturnType<typeof useTranslations>): string {
  if (seconds < 60) return t("timeSecondsAgo", { n: seconds });
  return t("timeMinutesAgo", { n: Math.round(seconds / 60) });
}

export function LivePayoutFeed() {
  const t = useTranslations("LivePayoutFeed");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PAYOUTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#2a2a50]/50 bg-[#111128]/50 backdrop-blur p-1">
      <div className="flex items-center gap-3 border-b border-[#2a2a50]/50 px-5 py-3">
        <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#10b981]">
          <div className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-ping" />
        </div>
        <span className="text-sm font-medium text-white">{t("header")}</span>
        <span className="ml-auto rounded-full bg-[#10b981]/10 px-2.5 py-0.5 text-xs font-medium text-[#10b981]">
          {t("badge")}
        </span>
      </div>

      <div className="relative h-[88px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-between px-5"
          >
            <div>
              <div className="mb-1 text-xs text-[#a0a0c0]">
                {PAYOUTS[activeIndex].id}
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-xs text-[#6b7280]">{t("views")}</span>
                  <p className="text-base font-bold text-white">
                    {PAYOUTS[activeIndex].views}
                  </p>
                </div>
                <div className="h-8 w-px bg-[#2a2a50]" />
                <div>
                  <span className="text-xs text-[#6b7280]">{t("amount")}</span>
                  <p className="text-base font-bold text-[#10b981]">
                    {formatCurrency(PAYOUTS[activeIndex].amount)}
                  </p>
                </div>
              </div>
            </div>
            <span className="text-xs text-[#6b7280]">
              {fmtTimeAgo(PAYOUTS[activeIndex].secondsAgo, t)}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
