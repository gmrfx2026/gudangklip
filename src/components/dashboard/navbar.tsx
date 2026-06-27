"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Bell, Search, CheckCheck, Menu } from "lucide-react";
import { getNotifications, getUnreadCount, markAllRead } from "@/actions/notification.actions";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/shared/locale-switcher";

type NotifItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { data: session } = useSession();
  const t = useTranslations();
  const locale = useLocale();
  const dateLocale = locale === "id" ? idLocale : enUS;
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUnreadCount().then(setUnread);
    const interval = setInterval(() => {
      getUnreadCount().then(setUnread);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!showDropdown) {
      getNotifications().then((data) => setNotifs(data as unknown as NotifItem[]));
    }
    setShowDropdown(!showDropdown);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setUnread(0);
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#2a2a50]/50 bg-[#0d0d22]/80 px-4 sm:px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="rounded-xl p-2 text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white transition-colors lg:hidden"
              aria-label={t("Navbar.openMenu")}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-white">
            {t("Navbar.greeting", { name: session?.user?.name?.split(" ")[0] ?? "" })}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/10 border border-[#10b981]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#10b981]">
            {t("Navbar.zeroFee")}
          </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a0c0]" />
          <input
            placeholder={t("Common.search")}
            aria-label={t("Common.search")}
            className="w-64 rounded-xl border border-[#2a2a50] bg-[#111128] py-2 pl-10 pr-4 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none"
          />
        </div>
        <LocaleSwitcher />
        <div ref={dropdownRef} className="relative">
          <button
            onClick={toggleDropdown}
            className="relative rounded-xl p-2 text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white transition-colors"
            aria-label={t("Navbar.notifications")}
            aria-expanded={showDropdown}
            aria-haspopup="true"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white px-0.5">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {showDropdown && (
            <div
              className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-[#2a2a50] bg-[#111128] shadow-2xl overflow-hidden"
              role="dialog"
              aria-label={t("Navbar.notifications")}
            >
              <div className="flex items-center justify-between border-b border-[#2a2a50]/50 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">{t("Navbar.notifications")}</h3>
                {unread > 0 && (
                  <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs text-[#a0a0c0] hover:text-white" aria-label={t("Navbar.markAllRead")}>
                    <CheckCheck className="h-3.5 w-3.5" /> {t("Navbar.markAllRead")}
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifs.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-[#8888aa]">{t("Navbar.noNotifications")}</p>
                ) : (
                  notifs.map((n) => (
                    <div key={n.id} className={`border-b border-[#2a2a50]/20 px-4 py-3 hover:bg-[#1e1e3f]/30 ${!n.isRead ? "bg-[#6c63ff]/5" : ""}`}>
                      <Link href={n.link || "#"} onClick={() => setShowDropdown(false)} className="block">
                        <p className="text-sm font-medium text-white">{n.title}</p>
                        <p className="mt-0.5 text-xs text-[#8888aa] line-clamp-2">{n.message}</p>
                        <p className="mt-1 text-[10px] text-[#666688]">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: dateLocale })}
                        </p>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
