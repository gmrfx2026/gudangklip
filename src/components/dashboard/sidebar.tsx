"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const role = (session?.user as any)?.role as keyof typeof SIDEBAR_LINKS;
  const links = SIDEBAR_LINKS[role] || [];

  return (
    <aside
      className={`relative flex flex-col border-r border-[#2a2a50]/50 bg-[#0d0d22] transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[#2a2a50]/50 px-4">
        <Link href="/" className="flex items-center gap-2">
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
          className="ml-auto rounded-lg p-1 text-[#8888aa] hover:bg-[#1e1e3f] hover:text-white"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? "bg-[#6c63ff]/10 text-[#6c63ff] font-medium"
                  : "text-[#8888aa] hover:bg-[#1e1e3f]/50 hover:text-[#e8e8f0]"
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
              <p className="truncate text-xs text-[#8888aa] capitalize">{role?.toLowerCase()}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#8888aa] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
