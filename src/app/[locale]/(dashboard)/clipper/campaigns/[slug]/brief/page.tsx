"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, Copy, CheckCheck, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function BriefPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations("CreatorBrief");
  const [expandedSections, setExpandedSections] = useState<string[]>(["syarat"]);
  const [copied, setCopied] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isExpanded = (key: string) => expandedSections.includes(key);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success(t("copySuccess"));
    setTimeout(() => setCopied(null), 2000);
  };

  const sections = [
    { key: "syarat", label: t("sectionAccount"), count: t("countRequired", { count: 2 }) },
    { key: "aturan", label: t("sectionContent"), count: t("countRequired", { count: 4 }) },
    { key: "narasi", label: t("sectionNarration"), count: t("countRequired", { count: 4 }) },
    { key: "caption", label: t("sectionCaption"), count: t("countRequired", { count: 3 }) },
    { key: "tentang", label: t("sectionAbout"), count: t("countRequired", { count: 1 }) },
  ];

  // Mock content arrays from translations
  const mockElements = t.raw("mockElements") as string[];
  const mockDos = t.raw("mockDos") as string[];
  const mockDonts = t.raw("mockDonts") as string[];
  const mockNarrations = t.raw("mockNarrations") as string[];
  const mockHashtags = t.raw("mockHashtags") as string[];

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <Link href={`/clipper/campaigns/${slug}`} className="mb-4 inline-flex items-center gap-1 text-sm text-[#a0a0c0] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>
      <div className="mb-6">
        <p className="text-sm text-[#6b7280]">{t("title")}:</p>
        <h1 className="text-2xl font-bold text-white">{slug.replace(/-/g, " ")}</h1>
        <p className="text-xs text-[#6b7280]">{t("createdAt", { date: "Jun 2026" })}</p>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.key}
            className="overflow-hidden rounded-2xl border border-[#2a2a50] bg-[#111128]/50"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.key)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[#1e1e3f]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">{section.label}</span>
                <span className="rounded-full bg-[#f59e0b]/10 px-2 py-0.5 text-xs font-medium text-[#f59e0b]">
                  {section.count}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isExpanded(section.key) ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-[#a0a0c0]" />
              </motion.div>
            </button>

            {/* Section Content */}
            <AnimatePresence initial={false}>
              {isExpanded(section.key) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[#2a2a50] px-5 pb-5 pt-4 space-y-4">
                    {section.key === "syarat" && (
                      <>
                        <div>
                          <p className="mb-1 text-sm font-medium text-[#a0a0c0]">{t("minFollowers")}</p>
                          <p className="text-white">{t("mockMinFollowersValue")}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-medium text-[#a0a0c0]">{t("allowedNiche")}</p>
                          <p className="text-white">{t("mockAllowedNicheValue")}</p>
                        </div>
                      </>
                    )}

                    {section.key === "aturan" && (
                      <>
                        <div>
                          <p className="mb-1 text-sm font-medium text-[#a0a0c0]">{t("allowedPlatforms")}</p>
                          <div className="flex gap-3">
                            <span className="text-white">TikTok</span>
                            <span className="text-white">Instagram</span>
                            <span className="text-white">YouTube</span>
                          </div>
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-medium text-[#a0a0c0]">{t("videoDuration")}</p>
                          <p className="text-white">{t("mockVideoDurationValue")}</p>
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium text-[#a0a0c0]">{t("requiredElements")}</p>
                          <div className="space-y-2">
                            {mockElements.map((item, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />
                                <span className="text-sm text-white">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium text-[#a0a0c0]">{t("doDonts")}</p>
                          <div className="space-y-2">
                            {mockDos.map((text, i) => (
                              <div key={`do-${i}`} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />
                                <span className="text-sm text-white">{text}</span>
                              </div>
                            ))}
                            {mockDonts.map((text, i) => (
                              <div key={`dont-${i}`} className="flex items-start gap-2">
                                <X className="mt-0.5 h-4 w-4 shrink-0 text-[#ef4444]" />
                                <span className="text-sm text-white">{text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {section.key === "narasi" && (
                      <>
                        <div>
                          <p className="mb-2 text-sm font-medium text-[#a0a0c0]">{t("requiredNarration")}</p>
                          <ol className="list-decimal space-y-1 pl-5">
                            {mockNarrations.map((text, i) => (
                              <li key={i} className="text-sm text-white">{text}</li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-medium text-[#a0a0c0]">{t("desiredImpression")}</p>
                          <p className="text-white">{t("mockDesiredImpressionValue")}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-medium text-[#a0a0c0]">{t("campaignGoal")}</p>
                          <p className="text-white">{t("mockCampaignGoalValue")}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-medium text-[#a0a0c0]">{t("ctaCall")}</p>
                          <p className="text-white">{t("mockCtaCallValue")}</p>
                        </div>
                      </>
                    )}

                    {section.key === "caption" && (
                      <>
                        <div>
                          <p className="mb-2 text-sm font-medium text-[#a0a0c0]">{t("requiredCaption")}</p>
                          <div className="flex items-center justify-between rounded-lg bg-[#0d0d22] p-3">
                            <p className="text-sm text-white">-</p>
                            <button onClick={() => copyToClipboard("-", "caption")} className="text-[#6c63ff] hover:text-white">
                              {copied === "caption" ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium text-[#a0a0c0]">{t("requiredHashtags")}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {mockHashtags.map((tag) => (
                              <span key={tag} className="rounded-full bg-[#1e1e3f] px-3 py-1 text-xs text-white">{tag}</span>
                            ))}
                          </div>
                          <button onClick={() => copyToClipboard(mockHashtags.join(" "), "hashtags")} className="text-xs text-[#6c63ff] hover:underline">
                            {copied === "hashtags" ? t("copySuccess") : t("copyAllHashtags")}
                          </button>
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium text-[#a0a0c0]">{t("requiredTag")}</p>
                          <div className="space-y-2">
                            {["TikTok", "Instagram", "YouTube"].map((p) => (
                              <div key={p} className="flex items-center gap-2">
                                <span className="text-sm text-[#a0a0c0]">{p}:</span>
                                <span className="text-sm text-white">-</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {section.key === "tentang" && (
                      <div>
                        <p className="mb-1 text-sm font-medium text-[#a0a0c0]">{t("mainTargetAudience")}</p>
                        <p className="text-white">{t("mockTargetAudienceValue")}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
