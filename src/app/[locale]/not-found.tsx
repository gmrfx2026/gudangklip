"use client";

import { useTranslations } from "next-intl";
import { FileQuestion } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function RootNotFound() {
  const t = useTranslations("NotFoundPage");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#6c63ff]/10">
        <FileQuestion className="h-10 w-10 text-[#6c63ff]" />
      </div>

      <h1 className="mb-2 text-6xl font-bold text-white">404</h1>
      <h2 className="mb-2 text-xl font-semibold text-white">
        {t("title")}
      </h2>
      <p className="mb-8 max-w-md text-sm text-[#a0a0c0]">
        {t("desc")}
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      >
        {t("backToHome")}
      </Link>
    </div>
  );
}
