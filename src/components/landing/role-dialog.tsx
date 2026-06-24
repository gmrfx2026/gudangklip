"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Building2, ArrowRight } from "lucide-react";

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RoleDialog({ open, onClose }: RoleDialogProps) {
  const t = useTranslations("RoleDialog");
  const router = useRouter();

  const handleSelect = (role: "clipper" | "brand") => {
    if (role === "clipper") {
      router.push("/register");
    } else {
      router.push("/register");
      // Role will be pre-selected via query param or stored
      sessionStorage.setItem("preferredRole", "BRAND");
      // Navigate with slight delay so sessionStorage is set
      setTimeout(() => router.push("/register"), 50);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative rounded-3xl border border-[#2a2a50] bg-[#111128] p-8 shadow-2xl">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-2 text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title */}
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-white">
                  {t("title")}
                </h2>
                <p className="text-sm text-[#a0a0c0]">
                  {t("subtitle")}
                </p>
              </div>

              {/* Role Cards */}
              <div className="space-y-4">
                <button
                  onClick={() => handleSelect("clipper")}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-[#2a2a50] bg-[#0d0d22] p-5 text-left hover:border-[#6c63ff]/50 hover:bg-[#1e1e3f]/50 transition-all duration-300"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff]/20 to-[#3b82f6]/20 group-hover:from-[#6c63ff]/30 group-hover:to-[#3b82f6]/30 transition-all">
                    <User className="h-6 w-6 text-[#6c63ff]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{t("clipperTitle")}</h3>
                    <p className="text-sm text-[#a0a0c0]">
                      {t("clipperDesc")}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#6c63ff] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>

                <button
                  onClick={() => handleSelect("brand")}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-[#2a2a50] bg-[#0d0d22] p-5 text-left hover:border-[#6c63ff]/50 hover:bg-[#1e1e3f]/50 transition-all duration-300"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b]/20 to-[#ef4444]/20 group-hover:from-[#f59e0b]/30 group-hover:to-[#ef4444]/30 transition-all">
                    <Building2 className="h-6 w-6 text-[#f59e0b]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{t("brandTitle")}</h3>
                    <p className="text-sm text-[#a0a0c0]">
                      {t("brandDesc")}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#f59e0b] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
