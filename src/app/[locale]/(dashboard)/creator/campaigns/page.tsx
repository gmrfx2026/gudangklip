"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { FolderOpen, Loader2 } from "lucide-react";
import { getCreatorCampaigns } from "@/actions/creator.actions";

type CreatorCampaign = {
  id: string;
  title: string;
  category: string;
  cpmRate: number;
  status: string;
  joinedAt: string;
  submissionsCount: number;
  totalViews: number;
  earnings: number;
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  DRAFT: { color: "text-[#a0a0c0]", bg: "bg-[#8888aa]/10", label: "Draft" },
  ACTIVE: { color: "text-[#10b981]", bg: "bg-[#10b981]/10", label: "Active" },
  PAUSED: { color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", label: "Paused" },
  ENDED: { color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", label: "Ended" },
};

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState<CreatorCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    getCreatorCampaigns()
      .then((data) => setCampaigns(data as unknown as CreatorCampaign[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t("CreatorCampaigns.title")}</h2>
        <p className="text-[#a0a0c0]">{t("CreatorCampaigns.subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FolderOpen className="h-16 w-16 text-[#2a2a50]" />
          <h3 className="mt-4 text-lg font-semibold text-white">{t("CreatorCampaigns.empty")}</h3>
          <p className="text-[#a0a0c0]">{t("CreatorCampaigns.emptyDesc")}</p>
          <Link href="/creator/explore" className="mt-4 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
            {t("CreatorCampaigns.exploreButton")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const config = statusConfig[c.status] || statusConfig.ACTIVE;
            return (
              <div key={c.id} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-full bg-[#6c63ff]/10 px-2.5 py-0.5 text-xs font-medium text-[#6c63ff]">
                        {CATEGORIES.find((cat) => cat.value === c.category)?.label || c.category}
                      </span>
                      <span className={`rounded-full ${config.bg} px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{c.title}</h3>
                    <p className="text-sm text-[#a0a0c0]">{t("CreatorCampaigns.joined")} {timeAgo(new Date(c.joinedAt))} &middot; CPM: Rp {c.cpmRate.toLocaleString()}/1K</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{c.submissionsCount}</div>
                      <div className="text-xs text-[#a0a0c0]">{t("CreatorCampaigns.submissions")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{c.totalViews.toLocaleString()}</div>
                      <div className="text-xs text-[#a0a0c0]">{t("CreatorCampaigns.totalViews")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#10b981]">{formatCurrency(c.earnings)}</div>
                      <div className="text-xs text-[#a0a0c0]">{t("CreatorCampaigns.earnings")}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
