"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Camera, MapPin, Loader2, Shield, User, AtSign, Key } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCreatorOverview } from "@/actions/creator.actions";
import { SocialConnect } from "@/components/clipper/social-connect";
import { toast } from "sonner";

type SettingsTab = "profile" | "account" | "verification" | "security";

export default function ClipperSettings() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState(session?.user?.name || "");

  useEffect(() => {
    getCreatorOverview()
      .then((d) => setEarnings((d as any).totalEarnings || 0))
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: SettingsTab; labelKey: string; icon: React.ReactNode }[] = [
    { key: "profile", labelKey: "tabProfile", icon: <User className="h-4 w-4" /> },
    { key: "account", labelKey: "tabAccount", icon: <AtSign className="h-4 w-4" /> },
    { key: "verification", labelKey: "tabVerification", icon: <Shield className="h-4 w-4" /> },
    { key: "security", labelKey: "tabSecurity", icon: <Key className="h-4 w-4" /> },
  ];

  const joinDate = "Jun 2026";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t("CreatorSettings.title")}</h1>
        <p className="text-sm text-[#a0a0c0]">{t("CreatorSettings.subtitle")}</p>
      </div>

      {/* Profile Banner Header */}
      <div className="overflow-hidden rounded-2xl border border-[#2a2a50] bg-[#111128]/50">
        <div className="flex h-24 items-center justify-center bg-gradient-to-r from-[#6c63ff]/20 to-[#3b82f6]/10">
          <span className="text-xs text-[#a0a0c0]">{t("CreatorSettings.profileHeader")}</span>
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-8 flex items-end gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#0a0a1a] bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-lg font-bold text-white">
                {session?.user?.name?.charAt(0) || "?"}
              </div>
              <button className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#6c63ff] text-white hover:bg-[#3b82f6] transition-colors">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{session?.user?.name || t("Sidebar.hubungiAdmin")}</h2>
                <button className="text-sm text-[#6c63ff] hover:underline">{t("CreatorSettings.edit")}</button>
              </div>
              <p className="text-xs text-[#a0a0c0]">
                {t("CreatorSettings.joined")} {joinDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#a0a0c0]">{t("CreatorSettings.totalEarnings")}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(earnings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#2a2a50] bg-[#0d0d22] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[#6c63ff] text-white"
                : "text-[#a0a0c0] hover:text-white"
            }`}
          >
            {tab.icon}
            {t(`CreatorSettings.${tab.labelKey}` as any)}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === "profile" && (
        <div className="space-y-4 rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("CreatorSettings.fullName")}</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("CreatorSettings.fullNamePlaceholder")}
              className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("CreatorSettings.email")}</label>
            <input
              value={session?.user?.email || ""}
              readOnly
              className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-[#a0a0c0]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("CreatorSettings.location")}</label>
            <div className="flex gap-2">
              <input
                placeholder={t("CreatorSettings.locationPlaceholder")}
                className="flex-1 rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none"
              />
              <button className="flex items-center gap-1.5 rounded-xl border border-[#2a2a50] px-4 py-3 text-sm text-[#a0a0c0] hover:bg-[#1e1e3f] transition-colors">
                <MapPin className="h-4 w-4" /> {t("CreatorSettings.detect")}
              </button>
            </div>
          </div>
          <button
            onClick={() => toast.success(t("CreatorSettings.toastSaved"))}
            className="rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {t("CreatorSettings.saveChanges")}
          </button>
        </div>
      )}

      {/* Tab: Account */}
      {activeTab === "account" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e1e3f] text-lg">G</div>
                <div>
                  <p className="font-medium text-white">{t("CreatorSettings.connectGoogle")}</p>
                  <p className="text-xs text-[#a0a0c0]">{t("CreatorSettings.googleDesc")}</p>
                </div>
              </div>
              <button className="rounded-xl border border-[#2a2a50] px-4 py-2 text-sm text-[#a0a0c0] hover:bg-[#1e1e3f] transition-colors">
                {t("CreatorSettings.connectGoogle")}
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
            <SocialConnect />
          </div>
        </div>
      )}

      {/* Tab: Verification */}
      {activeTab === "verification" && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-12 text-center">
          <p className="text-[#6b7280]">{t("CreatorSettings.comingSoon")}</p>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === "security" && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-12 text-center">
          <p className="text-[#6b7280]">{t("CreatorSettings.comingSoon")}</p>
        </div>
      )}
    </div>
  );
}
