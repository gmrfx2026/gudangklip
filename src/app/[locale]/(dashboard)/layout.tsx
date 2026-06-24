"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Navbar from "@/components/dashboard/navbar";
import ErrorBoundary from "@/components/shared/error-boundary";
import { X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Dashboard");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [showFeeBanner, setShowFeeBanner] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6c63ff] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a1a]">
      <Sidebar mobileOpen={sidebarMobileOpen} onCloseMobile={() => setSidebarMobileOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {showFeeBanner && (
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#6c63ff]/20 to-[#3b82f6]/20 border-b border-[#6c63ff]/20 px-4 py-1.5">
            <span className="text-xs font-medium text-[#e8e8f0]">{t("feeBanner")}</span>
            <button
              onClick={() => setShowFeeBanner(false)}
              className="ml-2 rounded p-0.5 text-[#a0a0c0] hover:text-white hover:bg-[#1e1e3f]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <Navbar onToggleSidebar={() => setSidebarMobileOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}