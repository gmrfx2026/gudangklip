"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Megaphone, TrendingUp, DollarSign, Users, Plus, Loader2, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { getBrandOverview } from "@/actions/campaign.actions";
import { reviewSubmission } from "@/actions/submission.actions";
import { toast } from "sonner";

type OverviewData = {
  activeCount: number;
  totalViews: number;
  totalBudget: number;
  usedBudget: number;
  uniqueCreators: number;
  recentSubmissions: {
    id: string;
    creatorName: string;
    campaignTitle: string;
    views: number;
    status: string;
  }[];
};

export default function BrandOverview() {
  const t = useTranslations();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    getBrandOverview()
      .then((d) => setData(d as unknown as OverviewData))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewSubmission(id, status);
      toast.success(status === "APPROVED" ? t("Brand.submissionApproved") : t("Brand.submissionRejected"));
      fetchData();
    } catch (err: any) {
      toast.error(err.message || t("Brand.reviewFailed"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
      </div>
    );
  }

  if (!data) return null;

  const budgetPercent = data.totalBudget > 0 ? Math.round((data.usedBudget / data.totalBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t("Brand.title")}</h2>
          <p className="text-[#a0a0c0]">{t("Brand.subtitle")}</p>
        </div>
        <Link
          href="/brand/campaigns/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> {t("Brand.createCampaign")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Megaphone className="h-5 w-5" />, label: t("Brand.activeCampaigns"), value: String(data.activeCount) },
          { icon: <TrendingUp className="h-5 w-5" />, label: t("Brand.totalViews"), value: formatCompactNumber(data.totalViews) },
          { icon: <DollarSign className="h-5 w-5" />, label: t("Brand.budgetUsed"), value: formatCurrency(data.usedBudget) },
          { icon: <Users className="h-5 w-5" />, label: t("Brand.activeCreators"), value: String(data.uniqueCreators) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c63ff]/10 text-[#6c63ff]">
                {stat.icon}
              </div>
              <span className="text-sm text-[#a0a0c0]">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="mt-1 text-xs text-[#a0a0c0]">
              {t("Brand.budgetPercent", { percent: budgetPercent })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">{t("Brand.recentSubmissions")}</h3>
        {data.recentSubmissions.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("Brand.noSubmissions")}</p>
        ) : (
          <div className="space-y-3">
            {data.recentSubmissions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                <div>
                  <p className="font-medium text-white">{sub.creatorName}</p>
                  <p className="text-xs text-[#a0a0c0]">{sub.campaignTitle}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#a0a0c0]">{formatCompactNumber(sub.views)} views</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      sub.status === "APPROVED" ? "bg-[#10b981]/10 text-[#10b981]" : sub.status === "REJECTED" ? "bg-[#ef4444]/10 text-[#ef4444]" : "bg-[#f59e0b]/10 text-[#f59e0b]"
                    }`}
                  >
                    {sub.status === "APPROVED" ? t("Brand.approved") : sub.status === "REJECTED" ? t("Brand.rejected") : t("Brand.pending")}
                  </span>
                  {sub.status === "PENDING" && (
                    <div className="flex gap-1">
                      <button onClick={() => handleReview(sub.id, "APPROVED")} className="rounded-lg p-1.5 text-[#10b981] hover:bg-[#10b981]/10" aria-label={t("Brand.approve")}><CheckCircle className="h-4 w-4" /></button>
                      <button onClick={() => handleReview(sub.id, "REJECTED")} className="rounded-lg p-1.5 text-[#ef4444] hover:bg-[#ef4444]/10" aria-label={t("Brand.reject")}><XCircle className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}