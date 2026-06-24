"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

export default function ClipperRules() {
  const t = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { qKey: "faq1q", aKey: "faq1a" },
    { qKey: "faq2q", aKey: "faq2a" },
    { qKey: "faq3q", aKey: "faq3a" },
    { qKey: "faq4q", aKey: "faq4a" },
    { qKey: "faq5q", aKey: "faq5a" },
  ];

  const rules = ["rules1", "rules2", "rules3", "rules4", "rules5"];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("CreatorRules.title")}</h1>
        <p className="text-sm text-[#a0a0c0]">{t("CreatorRules.subtitle")}</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-[#2a2a50] bg-[#111128]/50">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-white">
                {t(`CreatorRules.${faq.qKey}` as any)}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#a0a0c0] transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4">
                <p className="whitespace-pre-line text-sm text-[#a0a0c0]">
                  {t(`CreatorRules.${faq.aKey}` as any)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-white">{t("CreatorRules.rulesTitle")}</h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[#a0a0c0]">
          {rules.map((r, i) => (
            <li key={i}>{t(`CreatorRules.${r}` as any)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
