"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Sliders, TrendingUp } from "lucide-react";

const CPM_RATE = 3000; // Rp per 1K views
const MAX_VIEWS = 1000000;

export function RevenueCalculator() {
  const t = useTranslations("RevenueCalculator");
  const [views, setViews] = useState(50000);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate earnings
  const earnings = Math.round((views / 1000) * CPM_RATE);
  const formattedEarnings = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(earnings);

  // Calculate percentage for the slider fill
  const percentage = (views / MAX_VIEWS) * 100;

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-[#2a2a50]/50 bg-[#111128]/50 backdrop-blur p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-[#6c63ff]" />
          <span className="text-sm font-medium text-white">{t("title")}</span>
        </div>
        <div className="space-y-4">
          <div className="h-2 rounded-full bg-[#1a1a35]" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a0a0c0]">{t("estimatedViews")}</span>
            <span className="text-lg font-bold text-white">Rp 150.000</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-[#2a2a50]/50 bg-[#111128]/50 backdrop-blur p-6"
    >
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#6c63ff]/20 to-[#3b82f6]/20">
          <Sliders className="h-5 w-5 text-[#6c63ff]" />
        </div>
        <div>
          <span className="text-sm font-medium text-white">{t("title")}</span>
          <p className="text-xs text-[#6b7280]">{t("subtitle")}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Slider */}
        <div className="space-y-3">
          <div className="relative h-2">
            <div className="absolute inset-0 rounded-full bg-[#1a1a35]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <input
              type="range"
              min={1000}
              max={MAX_VIEWS}
              step={1000}
              value={views}
              onChange={(e) => setViews(Number(e.target.value))}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white border-2 border-[#6c63ff] shadow-lg shadow-[#6c63ff]/25"
              style={{ left: `calc(${percentage}% - 10px)` }}
            />
          </div>

          <div className="flex justify-between text-xs text-[#6b7280]">
            <span>{t("scale1k")}</span>
            <span>{t("scale250k")}</span>
            <span>{t("scale500k")}</span>
            <span>{t("scale750k")}</span>
            <span>{t("scale1m")}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#0d0d22] p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-[#a0a0c0]">
              <TrendingUp className="h-3.5 w-3.5" />
              {t("estimatedViews")}
            </div>
            <p className="text-lg font-bold text-white">
              {new Intl.NumberFormat("id-ID").format(views)}
            </p>
          </div>
          <div className="rounded-xl bg-[#0d0d22] p-4">
            <div className="mb-1 text-xs text-[#a0a0c0]">
              {t("estimatedEarnings")}
            </div>
            <p className="text-lg font-bold text-[#10b981]">
              {formattedEarnings}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#6b7280]">
          {t("disclaimer", { rate: CPM_RATE.toLocaleString("id-ID") })}
        </p>
      </div>
    </motion.div>
  );
}
