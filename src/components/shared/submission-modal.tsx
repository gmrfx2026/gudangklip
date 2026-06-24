"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  ExternalLink,
  Loader2,
  Info,
  FileText,
  Hash,
} from "lucide-react";
import { PLATFORMS } from "@/lib/constants";
import { submitVideo } from "@/actions/submission.actions";
import { getCreatorSocialAccounts } from "@/actions/creator.actions";
import { formatCompactNumber } from "@/lib/utils";
import { toast } from "sonner";

type SocialAccount = {
  id: string;
  platform: string;
  username: string;
  verified: boolean;
};

type SubmissionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaignTitle: string;
  endDate: string;
  onSuccess: () => void;
};

const platformColors: Record<string, string> = {
  TIKTOK: "border-[#00f2ea]/30 bg-[#00f2ea]/5 text-[#00f2ea]",
  INSTAGRAM: "border-[#e4405f]/30 bg-[#e4405f]/5 text-[#e4405f]",
  YOUTUBE: "border-[#ff0000]/30 bg-[#ff0000]/5 text-[#ff0000]",
};

const platformIcons: Record<string, string> = {
  TIKTOK: "T",
  INSTAGRAM: "I",
  YOUTUBE: "Y",
};

export function SubmissionModal({
  open,
  onOpenChange,
  campaignId,
  campaignTitle,
  endDate,
  onSuccess,
}: SubmissionModalProps) {
  const t = useTranslations("SubmissionModal");
  const [step, setStep] = useState(1);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const reset = useCallback(() => {
    setStep(1);
    setSelectedPlatform("");
    setVideoUrl("");
    setSubmitting(false);
  }, []);

  // Fetch social accounts when modal opens
  useEffect(() => {
    if (open) {
      setLoadingAccounts(true);
      getCreatorSocialAccounts()
        .then((data) => setAccounts(data))
        .catch(() => setAccounts([]))
        .finally(() => setLoadingAccounts(false));
    } else {
      reset();
    }
  }, [open, reset]);

  const handleSubmit = async () => {
    if (!selectedPlatform || !videoUrl) return;
    setSubmitting(true);
    try {
      await submitVideo({
        campaignId,
        platform: selectedPlatform,
        platformLink: videoUrl,
      });
      toast.success(t("toastSubmitSuccess"));
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || t("toastSubmitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const hoursLeft = Math.max(0, Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60)
  ));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out"
          asChild
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </Dialog.Overlay>
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2a2a50] bg-[#0f0f23] p-0 shadow-2xl"
          asChild
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1e1e3f] px-6 py-4">
              <div>
                <Dialog.Title className="text-lg font-bold text-white">
                  {t("title")}
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-xs text-[#a0a0c0]">
                  {campaignTitle}
                </Dialog.Description>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-[#1e1e3f]">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      step === s
                        ? "bg-[#6c63ff] text-white"
                        : step > s
                          ? "bg-[#10b981] text-white"
                          : "bg-[#1e1e3f] text-[#a0a0c0]"
                    }`}
                  >
                    {step > s ? <CheckCircle className="h-3.5 w-3.5" /> : s}
                  </div>
                  {s < 3 && <div className={`h-0.5 w-6 rounded transition-colors ${step > s ? "bg-[#10b981]" : "bg-[#1e1e3f]"}`} />}
                </div>
              ))}
              <span className="ml-auto text-xs font-medium text-[#a0a0c0]">
                {t("stepIndicator", { step })}
              </span>
            </div>

            {/* Content */}
            <div className="px-6 py-5 min-h-[280px]">
              <AnimatePresence mode="wait">
                {/* Step 1: Info Penting */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-3 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-4">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#f59e0b]" />
                      <div>
                        <h4 className="text-sm font-semibold text-[#f59e0b]">
                          {t("deadlineTitle")}
                        </h4>
                        <p className="mt-1 text-sm text-[#e8e8f0]">
                          {t.rich("deadlineMessage", {
                            important: (chunks) => (
                              <span className="font-bold text-[#f59e0b]">{chunks}</span>
                            ),
                            hours: (chunks) => (
                              <span className="font-bold">{chunks}</span>
                            ),
                            hoursLeft,
                          })}
                        </p>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-white">
                      {t("importantInfo")}
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          icon: <Info className="h-4 w-4" />,
                          text: t("infoBrief"),
                        },
                        {
                          icon: <FileText className="h-4 w-4" />,
                          text: t("infoReadBrief"),
                        },
                        {
                          icon: <Hash className="h-4 w-4" />,
                          text: t("infoHashtag"),
                        },
                        {
                          icon: <CheckCircle className="h-4 w-4" />,
                          text: t("infoReview"),
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-xl border border-[#1e1e3f] bg-[#111128]/30 p-3"
                        >
                          <div className="mt-0.5 shrink-0 text-[#6c63ff]">
                            {item.icon}
                          </div>
                          <p className="text-sm text-[#c0c0e0]">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Pilih Platform */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-[#a0a0c0]">
                      {t("selectPlatform")}
                    </p>

                    {loadingAccounts ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-[#6c63ff]" />
                      </div>
                    ) : accounts.length === 0 ? (
                      <div className="rounded-xl border border-[#2a2a50] bg-[#111128]/30 p-8 text-center">
                        <p className="text-sm text-[#a0a0c0]">
                          {t("noAccount")}
                        </p>
                        <p className="mt-2 text-xs text-[#6b7280]">
                          {t("noAccountHint")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {accounts.map((account) => {
                          const p = PLATFORMS.find(
                            (pp) => pp.value === account.platform
                          );
                          return (
                            <button
                              key={account.id}
                              onClick={() => setSelectedPlatform(account.platform)}
                              className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                                selectedPlatform === account.platform
                                  ? `${platformColors[account.platform] || "border-[#6c63ff]/50 bg-[#6c63ff]/5"} ring-1 ring-[#6c63ff]/30`
                                  : "border-[#2a2a50] bg-[#111128]/30 hover:border-[#6c63ff]/30"
                              }`}
                            >
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                  selectedPlatform === account.platform
                                    ? platformColors[account.platform] || "bg-[#6c63ff]/20 text-[#6c63ff]"
                                    : "bg-[#1e1e3f] text-[#a0a0c0]"
                                }`}
                              >
                                {platformIcons[account.platform] || "?"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white">
                                  {t(`Platform.${account.platform}` as any)}
                                </p>
                                <p className="text-xs text-[#a0a0c0] truncate">
                                  @{account.username}
                                </p>
                              </div>
                              {account.verified && (
                                <span className="rounded-full bg-[#10b981]/10 px-2 py-0.5 text-[10px] font-medium text-[#10b981]">
                                  {t("verified")}
                                </span>
                              )}
                              {selectedPlatform === account.platform && (
                                <CheckCircle className="h-5 w-5 text-[#6c63ff]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Video URL */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-3 rounded-xl border border-[#6c63ff]/20 bg-[#6c63ff]/5 p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6c63ff]/20 text-[#6c63ff] text-xs font-bold">
                        {platformIcons[selectedPlatform] || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {t(`Platform.${selectedPlatform}` as any)}
                        </p>
                        <p className="mt-1 text-xs text-[#a0a0c0]">
                          {t("urlDescription")}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">
                        {t("urlLabel")}
                      </label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a0c0]" />
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder={
                            selectedPlatform === "TIKTOK"
                              ? t("urlPlaceholderTikTok")
                              : selectedPlatform === "INSTAGRAM"
                                ? t("urlPlaceholderInstagram")
                                : t("urlPlaceholderYouTube")
                          }
                          className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/30"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-[#6b7280]">
                        {t("urlHint")}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#1e1e3f] px-6 py-4">
              <button
                onClick={() => step > 1 && setStep(step - 1)}
                disabled={step === 1}
                className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-medium text-[#a0a0c0] hover:text-white hover:bg-[#1e1e3f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("back")}
              </button>
              <button
                onClick={() => {
                  if (step === 3) {
                    handleSubmit();
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={
                  (step === 2 && !selectedPlatform) ||
                  (step === 3 && !videoUrl) ||
                  submitting
                }
                className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("submitting")}
                  </>
                ) : step === 3 ? (
                  <>
                    {t("submitButton")}
                    <CheckCircle className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    {t("next")}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
