"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckCheck } from "lucide-react";

type NotificationItem = {
  id: string;
  titleKey: string;
  bodyKey: string;
  time: string;
  link: string;
  category: "campaign" | "akun";
  read: boolean;
};

export default function ClipperNotifications() {
  const t = useTranslations();
  const [filter, setFilter] = useState<"all" | "unread" | "campaigns" | "akun">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      titleKey: "joinTitle",
      bodyKey: "joinBody",
      time: "1m ago",
      link: "/clipper/campaigns",
      category: "campaign",
      read: false,
    },
    {
      id: "2",
      titleKey: "welcomeTitle",
      bodyKey: "welcomeBody",
      time: "1d ago",
      link: "/clipper",
      category: "akun",
      read: true,
    },
  ]);

  const filters = [
    { key: "all" as const, labelKey: "filterAll" },
    { key: "unread" as const, labelKey: "filterUnread" },
    { key: "campaigns" as const, labelKey: "filterCampaigns" },
    { key: "akun" as const, labelKey: "filterAccount" },
  ];

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "campaigns") return n.category === "campaign";
    if (filter === "akun") return n.category === "akun";
    return true;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t("CreatorNotifications.title")}</h1>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border border-[#2a2a50] bg-[#0d0d22] p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"
              }`}
            >
              {t(`CreatorNotifications.${f.labelKey}` as any)}
            </button>
          ))}
        </div>
        <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[#a0a0c0] hover:text-white transition-colors">
          <CheckCheck className="h-3.5 w-3.5" /> {t("CreatorNotifications.markAllRead")}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[#6b7280]">{t("CreatorNotifications.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <Link
              key={n.id}
              href={n.link}
              className={`block rounded-xl border p-4 transition-colors ${
                n.read
                  ? "border-[#2a2a50] bg-[#111128]/30"
                  : "border-[#6c63ff]/30 bg-[#111128]/50 hover:border-[#6c63ff]/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    n.read ? "bg-[#1e1e3f]" : "bg-[#6c63ff]/20"
                  }`}
                >
                  <span className="text-sm">{n.read ? "O" : "N"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">
                      {t(`CreatorNotifications.${n.titleKey}` as any)}
                    </h3>
                    <span className="text-[10px] text-[#6b7280]">{n.time}</span>
                  </div>
                  <p className="text-xs text-[#a0a0c0]">
                    {t(`CreatorNotifications.${n.bodyKey}` as any)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
