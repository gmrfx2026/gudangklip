"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckCheck, Bell } from "lucide-react";
import { getNotifications, getUnreadCount, markAllRead } from "@/actions/notification.actions";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";

type NotifItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

function notifCategory(link: string | null): "campaign" | "akun" {
  if (!link) return "akun";
  return link.includes("/campaign") ? "campaign" : "akun";
}

export default function ClipperNotifications() {
  const t = useTranslations();
  const locale = useLocale();
  const dateLocale = locale === "id" ? idLocale : enUS;
  const [filter, setFilter] = useState<"all" | "unread" | "campaigns" | "akun">("all");
  const [notifs, setNotifs] = useState<NotifItem[]>([]);

  useEffect(() => {
    getNotifications().then((data) => setNotifs(data as unknown as NotifItem[]));
  }, []);

  const filters = [
    { key: "all" as const, labelKey: "filterAll" },
    { key: "unread" as const, labelKey: "filterUnread" },
    { key: "campaigns" as const, labelKey: "filterCampaigns" },
    { key: "akun" as const, labelKey: "filterAccount" },
  ];

  const filtered = notifs.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "campaigns") return notifCategory(n.link) === "campaign";
    if (filter === "akun") return notifCategory(n.link) === "akun";
    return true;
  });

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[#a0a0c0] hover:text-white transition-colors"
        >
          <CheckCheck className="h-3.5 w-3.5" /> {t("CreatorNotifications.markAllRead")}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Bell className="mx-auto h-10 w-10 text-[#a0a0c0]/30" />
          <p className="mt-4 text-[#6b7280]">{t("CreatorNotifications.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              className={`block rounded-xl border p-4 transition-colors ${
                n.isRead
                  ? "border-[#2a2a50] bg-[#111128]/30"
                  : "border-[#6c63ff]/30 bg-[#111128]/50 hover:border-[#6c63ff]/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    n.isRead ? "bg-[#1e1e3f]" : "bg-[#6c63ff]/20"
                  }`}
                >
                  <Bell className={`h-4 w-4 ${n.isRead ? "text-[#a0a0c0]" : "text-[#6c63ff]"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className={`text-sm font-medium ${n.isRead ? "text-[#a0a0c0]" : "text-white"}`}>
                      {n.title}
                    </h3>
                    <span className="shrink-0 text-[10px] text-[#6b7280]">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: dateLocale })}
                    </span>
                  </div>
                  <p className="text-xs text-[#a0a0c0] line-clamp-2">
                    {n.message}
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
