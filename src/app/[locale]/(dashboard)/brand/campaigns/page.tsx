"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Plus, DollarSign, Users, BarChart3, Loader2, Megaphone } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { getBrandCampaigns } from "@/actions/campaign.actions";

type CampaignItem = {
  id: string;
  title: string;
  category: string;
  cpmRate: number;
  totalBudget: number;
  remainingBudget: number;
  status: string;
  totalViews: number;
  _count: { participants: number; submissions: number };
};

export default function BrandCampaigns() {
  const t = useTranslations();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrandCampaigns()
      .then((data) => setCampaigns(data as unknown as CampaignItem[]))
      .finally(() => setLoading(false));
  }, []);

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    DRAFT: { color: "text-[#a0a0c0]", bg: "bg-[#8888aa]/10", label: "Draft" },
    ACTIVE: { color: "text-[#10b981]", bg: "bg-[#10b981]/10", label: "Active" },
    PAUSED: { color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", label: "Paused" },
    ENDED: { color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", label: "Ended" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t("BrandCampaigns.title")}</h2>
          <p className="text-[#a0a0c0]">{t("BrandCampaigns.subtitle")}</p>
        </div>
        <Link
          href="/brand/campaigns/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> {t("BrandCampaigns.createButton")}
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Megaphone className="mb-4 h-12 w-12 text-[#a0a0c0]" />
          <h3 className="text-lg font-semibold text-white">{t("BrandCampaigns.empty")}</h3>
          <p className="mt-1 text-sm text-[#a0a0c0]">{t("BrandCampaigns.emptyDesc")}</p>
          <Link
            href="/brand/campaigns/new"
            className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> {t("BrandCampaigns.createButton")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const config = statusConfig[c.status];
            const budgetUsed = c.totalBudget - c.remainingBudget;
            const budgetPercent = Math.round((budgetUsed / c.totalBudget) * 100);
            const totalViewsK = Math.round(c.totalViews / 1000);
            return (
              <div key={c.id} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-[#6c63ff]/10 px-2.5 py-0.5 text-xs font-medium text-[#6c63ff]">
                        {CATEGORIES.find((cat) => cat.value === c.category)?.label}
                      </span>
                      <span className={`rounded-full ${config.bg} px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{c.title}</h3>
                    <p className="text-sm text-[#a0a0c0]">CPM: Rp {c.cpmRate.toLocaleString()}/1K views</p>
                  </div>
                  <div className="flex gap-6 lg:gap-8">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-lg font-bold text-white">
                        <Users className="h-4 w-4" /> {c._count.participants}
                      </div>
                      <div className="text-xs text-[#a0a0c0]">{t("BrandCampaigns.creators")}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-lg font-bold text-white">
                        <BarChart3 className="h-4 w-4" /> {totalViewsK}K
                      </div>
                      <div className="text-xs text-[#a0a0c0]">{t("BrandCampaigns.views")}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-lg font-bold text-white">
                        <DollarSign className="h-4 w-4" /> {formatCurrency(c.remainingBudget)}
                      </div>
                      <div className="text-xs text-[#a0a0c0]">{t("BrandCampaigns.remainingBudget")}</div>
                    </div>
                  </div>
                  <div>
                    <Link
                      href={`/brand/campaigns/${c.id}`}
                      className="rounded-xl border border-[#2a2a50] px-4 py-2 text-sm font-medium text-[#e8e8f0] hover:bg-[#1e1e3f] transition-colors"
                    >
                      {t("BrandCampaigns.viewDetail")}
                    </Link>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[#a0a0c0]">{t("BrandCampaigns.budget")}: {formatCurrency(budgetUsed)} / {formatCurrency(c.totalBudget)}</span>
                    <span className="text-white">{budgetPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1a1a35]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]" style={{ width: `${budgetPercent}%` }} />
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
