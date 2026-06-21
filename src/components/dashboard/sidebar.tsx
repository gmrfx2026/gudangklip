"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { SIDEBAR_LINKS } from "@/lib/constants";
import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  Wallet,
  Users,
  Banknote,
  LogOut,
  ChevronLeft,
  X,
  Bell,
  User,
  HelpCircle,
  Shield,
  MessageCircle,
  Search,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { getCreatorJoinedCampaignIds } from "@/actions/creator.actions";
import { getActiveCampaigns } from "@/actions/campaign.actions";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  Wallet,
  Users,
  Banknote,
  Search,
  User,
  Settings,
};

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

type JoinedCampaign = {
  id: string;
  title: string;
  slug?: string;
  brand: { name: string | null; image: string | null };
};

function SidebarContent({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState(false);
  const [joinedCampaigns, setJoinedCampaigns] = useState<JoinedCampaign[]>([]);
  const role = (session?.user as any)?.role as keyof typeof SIDEBAR_LINKS;
  const links = SIDEBAR_LINKS[role] || [];

  // Map sidebar href to i18n key
  const getLinkLabel = (href: string, fallback: string): string => {
    const keyMap: Record<string, string> = {
      "/brand": "overview",
      "/brand/campaigns": "campaigns",
      "/brand/analytics": "analytics",
      "/brand/budget": "budget",
      "/brand/settings": "settings",
      "/clipper": "overview",
      "/clipper/campaigns": "myCampaigns",
      "/clipper/analytic": "analytics",
      "/clipper/earnings": "wallet",
      "/agency": "overview",
      "/agency/members": "members",
      "/admin": "overview",
      "/admin/users": "users",
      "/admin/payouts": "payouts",
    };
    const key = keyMap[href];
    return key ? t(`Sidebar.${key}`) : fallback;
  };

  useEffect(() => {
    if (role === "CREATOR") {
      Promise.all([getCreatorJoinedCampaignIds(), getActiveCampaigns()])
        .then(([ids, campaigns]) => {
          const joined = (campaigns as any[])
            .filter((c: any) => ids.includes(c.id))
            .slice(0, 5);
          setJoinedCampaigns(joined as unknown as JoinedCampaign[]);
        })
        .catch(() => {});
    }
    if (role === "BRAND") {
      getActiveCampaigns()
        .then((campaigns) => {
          const brandCampaigns = (campaigns as any[])
            .filter((c: any) => c.brandId === (session?.user as any)?.id)
            .slice(0, 5);
          setJoinedCampaigns(brandCampaigns as unknown as JoinedCampaign[]);
        })
        .catch(() => {});
    }
  }, [role, session]);

  const isCreator = role === "CREATOR";
  const isBrand = role === "BRAND";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[#2a2a50]/50 px-4">
        <Link href="/" className="flex items-center gap-2" onClick={onCloseMobile}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-sm font-bold text-white">
            G
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white">
              Gudang<span className="gradient-text">Klip</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto hidden rounded-lg p-1 text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white lg:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="ml-auto rounded-lg p-1 text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => {
          const Icon = ICON_MAP[link.icon] || LayoutDashboard;
          const isActive = pathname === link.href || (link.href !== "/clipper" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? "bg-[#6c63ff]/10 text-[#6c63ff] font-medium"
                  : "text-[#a0a0c0] hover:bg-[#1e1e3f]/50 hover:text-[#e8e8f0]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{getLinkLabel(link.href, link.label)}</span>}
            </Link>
          );
        })}

        {/* Active Campaigns Section (Clipper only) */}
        {isCreator && !collapsed && (
          <div className="pt-4">
            <div className="mb-2 px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                Campaign Aktif Diikuti
              </p>
            </div>
            {joinedCampaigns.length === 0 ? (
              <div className="px-3 py-2">
                <p className="text-xs text-[#6b7280]">Belum join campaign apapun.</p>
                <Link
                  href="/clipper/campaigns"
                  onClick={onCloseMobile}
                  className="mt-1 flex items-center gap-1 text-xs text-[#6c63ff] hover:underline"
                >
                  Jelajahi campaign
                  <Search className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              joinedCampaigns.map((c) => (
                <Link
                  key={c.id}
                  href={`/clipper/campaigns/${c.slug || c.id}`}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                    pathname.includes(c.id)
                      ? "bg-[#6c63ff]/10 text-[#6c63ff]"
                      : "text-[#a0a0c0] hover:bg-[#1e1e3f]/50 hover:text-[#e8e8f0]"
                  }`}
                >
                  {c.brand?.image ? (
                    <img src={c.brand.image} alt="" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e1e3f] text-[10px] text-[#a0a0c0]">
                      {(c.brand?.name || c.title).charAt(0)}
                    </div>
                  )}
                  {!collapsed && <span className="truncate text-xs">{c.brand?.name || c.title}</span>}
                </Link>
              ))
            )}
          </div>
        )}

        {/* Campaign Saya Section (Brand only) */}
        {isBrand && !collapsed && (
          <div className="pt-4">
            <div className="mb-2 px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                {t("Sidebar.campaignSaya")}
              </p>
            </div>
            {joinedCampaigns.length === 0 ? (
              <div className="px-3 py-2">
                <p className="text-xs text-[#6b7280]">{t("Brand.noCampaigns")}</p>
              </div>
            ) : (
              joinedCampaigns.map((c) => (
                <Link
                  key={c.id}
                  href={`/brand/campaigns/${c.slug || c.id}`}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                    pathname.includes(c.id)
                      ? "bg-[#6c63ff]/10 text-[#6c63ff]"
                      : "text-[#a0a0c0] hover:bg-[#1e1e3f]/50 hover:text-[#e8e8f0]"
                  }`}
                >
                  <Megaphone className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate text-xs">{c.title}</span>}
                </Link>
              ))
            )}
          </div>
        )}

        {/* Help Section (Brand only) */}
        {isBrand && !collapsed && (
          <div className="pt-4">
            <div className="mb-2 px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                {t("Sidebar.helpSection")}
              </p>
            </div>
            <a
              href="https://wa.me/6281113098585?text=Halo%20admin%20GudangKlip%2C%20saya%20mau%20bertanya%20perihal%20platformnya%2C%20bisa%20tolong%20dibantu%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#a0a0c0] hover:bg-[#1e1e3f]/50 hover:text-[#e8e8f0] transition-colors"
            >
              <MessageCircle className="h-5 w-5 shrink-0" />
              <span>{t("Sidebar.hubungiAdmin")}</span>
            </a>
          </div>
        )}

        {/* Help Section (Clipper only) */}
        {isCreator && !collapsed && (
          <div className="pt-4">
            <div className="mb-2 px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                Butuh Bantuan?
              </p>
            </div>
            <a
              href="https://wa.me/6281113098585?text=Halo%20admin%20GudangKlip%2C%20saya%20mau%20bertanya%20perihal%20platformnya%2C%20bisa%20tolong%20dibantu%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#a0a0c0] hover:bg-[#1e1e3f]/50 hover:text-[#e8e8f0] transition-colors"
            >
              <MessageCircle className="h-5 w-5 shrink-0" />
              <span>Hubungi Admin</span>
            </a>
            <Link
              href="/clipper/rules"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                pathname === "/clipper/rules"
                  ? "bg-[#6c63ff]/10 text-[#6c63ff]"
                  : "text-[#a0a0c0] hover:bg-[#1e1e3f]/50 hover:text-[#e8e8f0]"
              }`}
            >
              <Shield className="h-5 w-5 shrink-0" />
              <span>FaQ & Peraturan</span>
            </Link>
          </div>
        )}

        {/* Bottom Navigation */}
        {isCreator && (
          <div className="pt-2">
            <Link
              href="/clipper/settings"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                pathname === "/clipper/settings"
                  ? "bg-[#6c63ff]/10 text-[#6c63ff]"
                  : "text-[#a0a0c0] hover:bg-[#1e1e3f]/50 hover:text-[#e8e8f0]"
              }`}
            >
              <User className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Profile</span>}
            </Link>
            <Link
              href="/clipper/notifications"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                pathname === "/clipper/notifications"
                  ? "bg-[#6c63ff]/10 text-[#6c63ff]"
                  : "text-[#a0a0c0] hover:bg-[#1e1e3f]/50 hover:text-[#e8e8f0]"
              }`}
            >
              <Bell className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Notifikasi</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#2a2a50]/50 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#1e1e3f]/30 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-xs font-bold text-white">
            {session?.user?.name?.charAt(0) || "?"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{session?.user?.name}</p>
              <p className="truncate text-xs text-[#a0a0c0] capitalize">{role === "CREATOR" ? "Clipper" : role?.toLowerCase()}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#a0a0c0] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-[#0d0d22] border-r border-[#2a2a50]/50 animate-slide-in">
            <SidebarContent onCloseMobile={onCloseMobile} />
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-[#2a2a50]/50 bg-[#0d0d22] transition-all duration-300">
        <SidebarContent />
      </aside>
    </>
  );
}
