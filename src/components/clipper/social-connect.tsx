"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { PLATFORMS } from "@/lib/constants";
import { getCreatorSocialAccounts, addSocialAccount, disconnectSocialAccount } from "@/actions/creator.actions";
import { toast } from "sonner";

type SocialAccount = {
  id: string;
  platform: string;
  username: string;
  verified: boolean;
  followersCount: number;
};

const platformMeta: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  TIKTOK: { color: "#00f2ea", bg: "bg-[#00f2ea]/5", border: "border-[#00f2ea]/30", icon: "T" },
  INSTAGRAM: { color: "#e4405f", bg: "bg-[#e4405f]/5", border: "border-[#e4405f]/30", icon: "I" },
  YOUTUBE: { color: "#ff0000", bg: "bg-[#ff0000]/5", border: "border-[#ff0000]/30", icon: "Y" },
};

export function SocialConnect() {
  const t = useTranslations("SocialConnect");
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);

  const fetchAccounts = useCallback(() => {
    setLoading(true);
    getCreatorSocialAccounts()
      .then((data) => setAccounts(data))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleAdd = async () => {
    if (!selectedPlatform || !username.trim()) return;
    setSaving(true);
    try {
      await addSocialAccount(selectedPlatform, username.trim());
      toast.success(t("toastConnected"));
      setDialogOpen(false);
      setSelectedPlatform("");
      setUsername("");
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || t("toastFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    setDeleting(accountId);
    try {
      await disconnectSocialAccount(accountId);
      toast.success(t("toastDisconnected"));
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || t("toastFailed"));
    } finally {
      setDeleting(null);
    }
  };

  const connectedPlatforms = accounts.map((a) => a.platform);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
          <p className="mt-0.5 text-xs text-[#a0a0c0]">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          disabled={accounts.length >= 3}
          className="flex items-center gap-1.5 rounded-lg bg-[#6c63ff]/20 px-3 py-1.5 text-xs font-medium text-[#6c63ff] hover:bg-[#6c63ff]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addAccount")}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#6c63ff]" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2a2a50] bg-[#0d0d22]/50 p-8 text-center">
          <p className="text-sm text-[#a0a0c0]">{t("empty")}</p>
          <p className="mt-1 text-xs text-[#6b7280]">{t("emptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => {
            const meta = platformMeta[account.platform] || platformMeta.TIKTOK;
            return (
              <div
                key={account.id}
                className={`flex items-center gap-4 rounded-xl border p-4 ${meta.border} ${meta.bg}`}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                  style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                >
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{t(`Platform.${account.platform}` as any)}</p>
                    {account.verified ? (
                      <span className="flex items-center gap-1 rounded-full bg-[#10b981]/10 px-2 py-0.5 text-[10px] font-medium text-[#10b981]">
                        <CheckCircle className="h-3 w-3" />
                        {t("verified")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-[#f59e0b]/10 px-2 py-0.5 text-[10px] font-medium text-[#f59e0b]">
                        <AlertCircle className="h-3 w-3" />
                        {t("unverified")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#a0a0c0] truncate">@{account.username}</p>
                </div>
                <button
                  onClick={() => handleDisconnect(account.id)}
                  disabled={deleting === account.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-red-400 disabled:opacity-40 transition-colors"
                >
                  {deleting === account.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Account Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-50 bg-black/60"
            asChild
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          </Dialog.Overlay>
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2a2a50] bg-[#0f0f23] p-0 shadow-2xl"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between border-b border-[#1e1e3f] px-6 py-4">
                <Dialog.Title className="text-lg font-bold text-white">{t("dialogTitle")}</Dialog.Title>
                <button onClick={() => setDialogOpen(false)} className="rounded-lg p-1.5 text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-5">
                {/* Platform Select */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#e8e8f0]">{t("platformLabel")}</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowPlatforms(!showPlatforms)}
                      className="flex w-full items-center justify-between rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white"
                    >
                      {selectedPlatform ? (
                        <span className="flex items-center gap-2">
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
                            style={{ backgroundColor: `${platformMeta[selectedPlatform]?.color || "#6c63ff"}20`, color: platformMeta[selectedPlatform]?.color || "#6c63ff" }}
                          >
                            {platformMeta[selectedPlatform]?.icon || "?"}
                          </span>
                          {t(`Platform.${selectedPlatform}` as any)}
                        </span>
                      ) : (
                        <span className="text-[#a0a0c0]">{t("platformPlaceholder")}</span>
                      )}
                      <ChevronDown className={`h-4 w-4 text-[#a0a0c0] transition-transform ${showPlatforms ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showPlatforms && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-[#2a2a50] bg-[#0f0f23] py-1 shadow-lg"
                        >
                          {PLATFORMS.map((p) => {
                            const connected = connectedPlatforms.includes(p.value);
                            const meta = platformMeta[p.value];
                            return (
                              <button
                                key={p.value}
                                onClick={() => {
                                  setSelectedPlatform(p.value);
                                  setShowPlatforms(false);
                                }}
                                disabled={connected}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#1e1e3f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <span
                                  className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
                                  style={{ backgroundColor: `${meta?.color || "#6c63ff"}20`, color: meta?.color || "#6c63ff" }}
                                >
                                  {meta?.icon || "?"}
                                </span>
                                <span>{t(`Platform.${p.value}` as any)}</span>
                                {connected && <span className="ml-auto text-[10px] text-[#6b7280]">{t("alreadyConnected")}</span>}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#e8e8f0]">{t("usernameLabel")}</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("usernamePlaceholder")}
                    className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none"
                  />
                </div>

                {/* Note */}
                <div className="rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-3">
                  <p className="text-xs text-[#f59e0b]">{t("verificationNote")}</p>
                </div>
              </div>

              <div className="border-t border-[#1e1e3f] px-6 py-4">
                <button
                  onClick={handleAdd}
                  disabled={!selectedPlatform || !username.trim() || saving}
                  className="w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("connecting")}
                    </span>
                  ) : (
                    t("connectButton")
                  )}
                </button>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
