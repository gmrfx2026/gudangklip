"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Dashboard error:", error.message);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#ef4444]/10">
        <AlertTriangle className="h-10 w-10 text-[#ef4444]" />
      </div>

      <h1 className="mb-2 text-2xl font-bold text-white">
        Dashboard Error
      </h1>
      <p className="mb-8 max-w-md text-sm text-[#8888aa]">
        Gagal memuat halaman dashboard. Data mungkin sedang tidak tersedia.
      </p>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="h-4 w-4" />
          Muat Ulang
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#2a2a50] bg-transparent px-6 py-3 text-sm font-medium text-[#8888aa] hover:bg-[#1a1a3e] transition-colors"
        >
          <Home className="h-4 w-4" />
          Beranda
        </Link>
      </div>
    </div>
  );
}
