"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { SIDEBAR_LINKS } from "@/lib/constants";
import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  Search,
  FolderOpen,
  Video,
  Wallet,
  Users,
  Banknote,
  LogOut,
  ChevronLeft,
  X,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  Search,
  FolderOpen,
  Video,
  Wallet,
  Users,
  Banknote,
};

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

function SidebarContent({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState(false);
  const role = (session?.user as any)?.role as keyof typeof SIDEBAR_LINKS;
  const links = SIDEBAR_LINKS[role] || [];

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
        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto hidden rounded-lg p-1 text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white lg:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
        {/* Mobile close */}
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

      {/* Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => {
          const Icon = ICON_MAP[link.icon] || LayoutDashboard;
          const isActive = pathname === link.href;
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
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
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
              <p className="truncate text-xs text-[#a0a0c0] capitalize">{role?.toLowerCase()}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#a0a0c0] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{t("Sidebar.logout")}</span>}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
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

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-[#2a2a50]/50 bg-[#0d0d22] transition-all duration-300">
        <SidebarContent />
      </aside>
    </>
  );
}
