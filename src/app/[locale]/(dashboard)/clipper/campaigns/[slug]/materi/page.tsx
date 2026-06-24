"use client";

import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Download } from "lucide-react";

export default function MateriPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations("CreatorMateri");

  const materials = [
    { name: t("materialLogoBrand"), type: "PNG/SVG", description: t("materialLogoBrandDesc") },
    { name: t("materialProductFootage"), type: "MP4", description: t("materialProductFootageDesc") },
    { name: t("materialBackgroundMusic"), type: "MP3", description: t("materialBackgroundMusicDesc") },
    { name: t("materialOverlayTemplate"), type: "PSD/PNG", description: t("materialOverlayTemplateDesc") },
  ];

  return (
    <div className="max-w-3xl">
      <Link href={`/clipper/campaigns/${slug}`} className="mb-4 inline-flex items-center gap-1 text-sm text-[#a0a0c0] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>
      <div className="mb-6">
        <p className="text-sm text-[#6b7280]">{t("title")}:</p>
        <h1 className="text-2xl font-bold text-white">{slug.replace(/-/g, " ")}</h1>
      </div>

      <div className="space-y-3">
        {materials.map((m, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-[#2a2a50] bg-[#111128]/50 p-4">
            <div>
              <h3 className="font-medium text-white">{m.name}</h3>
              <p className="text-xs text-[#a0a0c0]">{m.type} &middot; {m.description}</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white">
              <Download className="h-3.5 w-3.5" /> {t("download")}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-[#6b7280]">{t("availableAfterJoin")}</p>
    </div>
  );
}
