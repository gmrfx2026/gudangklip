"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const nextLocale = locale === "id" ? "en" : "id";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#8888aa] hover:bg-[#1e1e3f] hover:text-white transition-colors"
      title={locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{locale === "id" ? "EN" : "ID"}</span>
    </button>
  );
}
