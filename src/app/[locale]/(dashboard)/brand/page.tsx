"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import {
  Megaphone,
  TrendingUp,
  Eye,
  DollarSign,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Edit,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { getBrandOverview } from "@/actions/campaign.actions";
import { reviewSubmission } from "@/actions/submission.actions";
import { toast } from "sonner";

type CampaignCard = {
  id: string;
  title: string;
  status: string;
  cpmRate: number;
  totalBudget: number;
  remainingBudget: number;
  totalViews: number;
  creatorCount: number;
  platforms: string[];
};

type ApprovedVideo = {
  id: string;
  creatorName: string;
  creatorImage: string | null;
  campaignTitle: string;
  videoUrl: string | null;
  platformLink: string | null;
  platform: string | null;
  views: number;
  reviewedAt: string | null;
};

type OverviewData = {
  activeCount: number;
  totalViews: number;
  totalBudget: number;
  usedBudget: number;
  uniqueCreators: number;
  needToReview: number;
  totalSubmissions: number;
  campaignCards: CampaignCard[];
  approvedVideos: ApprovedVideo[];
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
  const { data: session } = useSession();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

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

  const userName = session?.user?.name || "Brand";
  const budgetPercent = data.totalBudget > 0 ? Math.round((data.usedBudget / data.totalBudget) * 100) : 0;

  // Filter campaigns
  const filteredCampaigns = campaignFilter === "all"
    ? data.campaignCards
    : data.campaignCards.filter((c) => c.status === campaignFilter);

  // Filter approved videos
  const filteredVideos = platformFilter === "all"
    ? data.approvedVideos
    : data.approvedVideos.filter((v) => v.platform === platformFilter);

  const campaignFilterTabs = ["all", "ACTIVE", "PAUSED", "ENDED"];
  const platformFilterTabs = ["all", "TIKTOK", "INSTAGRAM", "YOUTUBE"];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {t("Brand.welcomeBack", { name: userName })}
          </h2>
          <p className="text-[#a0a0c0]">{t("Brand.subtitle")}</p>
        </div>
        <Link
          href="/brand/campaigns/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> {t("Brand.addCampaign")}
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Eye className="h-5 w-5" />, label: t("Brand.totalViews"), value: formatCompactNumber(data.totalViews) },
          { icon: <Clock className="h-5 w-5" />, label: t("Brand.needToReview"), value: String(data.needToReview) },
          { icon: <TrendingUp className="h-5 w-5" />, label: t("Brand.totalSubmissions"), value: String(data.totalSubmissions) },
          { icon: <DollarSign className="h-5 w-5" />, label: t("Brand.budgetSpent"), value: formatCurrency(data.usedBudget) },
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

      {/* Total Campaigns */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{t("Brand.totalCampaigns")}</h3>
        </div>

        {/* Campaign Filter Tabs */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {campaignFilterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setCampaignFilter(tab)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                campaignFilter === tab
                  ? "bg-[#6c63ff] text-white"
                  : "bg-[#0d0d22] text-[#a0a0c0] hover:text-white"
              }`}
            >
              {tab === "all" ? t("Brand.filterSemua") : tab === "ACTIVE" ? t("Brand.filterActive") : tab === "PAUSED" ? t("Brand.filterPaused") : t("Brand.filterEnded")}
            </button>
          ))}
        </div>

        {filteredCampaigns.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("Brand.noCampaigns")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((camp) => (
              <div key={camp.id} className="rounded-xl border border-[#2a2a50]/50 bg-[#0d0d22] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    camp.status === "ACTIVE" ? "bg-[#10b981]/10 text-[#10b981]" :
                    camp.status === "PAUSED" ? "bg-[#f59e0b]/10 text-[#f59e0b]" :
                    camp.status === "DRAFT" ? "bg-[#8888aa]/10 text-[#a0a0c0]" :
                    "bg-[#ef4444]/10 text-[#ef4444]"
                  }`}>
                    {camp.status === "ACTIVE" ? t("Brand.filterActive") : camp.status === "PAUSED" ? t("Brand.filterPaused") : camp.status === "DRAFT" ? t("Brand.draft") : t("Brand.filterEnded")}
                  </span>
                  <div className="flex gap-1">
                    {camp.platforms.map((p) => (
                      <span key={p} className="rounded bg-[#1e1e3f] px-1.5 py-0.5 text-[10px] text-[#a0a0c0]">
                        {t(`Platform.${p}`)}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href={`/brand/campaigns/${camp.id}`} className="block">
                  <h4 className="font-semibold text-white hover:text-[#6c63ff] transition-colors">{camp.title}</h4>
                </Link>
                <div className="mt-2 flex items-center gap-4 text-xs text-[#a0a0c0]">
                  <span>{formatCompactNumber(camp.totalViews)} {t("Brand.colViews")}</span>
                  <span>{camp.creatorCount} {t("BrandCampaignDetail.creators")}</span>
                </div>
                <div className="mt-2 text-xs text-[#a0a0c0]">
                  {t("Brand.budgetLabel")}: {formatCurrency(camp.remainingBudget)} / {formatCurrency(camp.totalBudget)}
                </div>
                {/* Budget bar */}
                <div className="mt-1.5 h-1 w-full rounded-full bg-[#1e1e3f]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]"
                    style={{ width: `${camp.totalBudget > 0 ? Math.round(((camp.totalBudget - camp.remainingBudget) / camp.totalBudget) * 100) : 0}%` }}
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  {camp.status === "ACTIVE" && (
                    <button onClick={() => toast.success(t("Brand.pauseSuccess"))} className="rounded-lg bg-[#f59e0b]/10 px-2.5 py-1 text-xs text-[#f59e0b] hover:bg-[#f59e0b]/20">
                      <Pause className="h-3 w-3 inline mr-1" />{t("Brand.pauseCampaign")}
                    </button>
                  )}
                  {(camp.status === "ACTIVE" || camp.status === "PAUSED") && (
                    <button onClick={() => toast.success(t("Brand.closeSuccess"))} className="rounded-lg bg-[#ef4444]/10 px-2.5 py-1 text-xs text-[#ef4444] hover:bg-[#ef4444]/20">
                      <XCircle className="h-3 w-3 inline mr-1" />{t("Brand.closeCampaign")}
                    </button>
                  )}
                  <Link
                    href={`/brand/campaigns/${camp.id}`}
                    className="rounded-lg bg-[#6c63ff]/10 px-2.5 py-1 text-xs text-[#6c63ff] hover:bg-[#6c63ff]/20"
                  >
                    <Edit className="h-3 w-3 inline mr-1" />{t("Brand.editCampaign")}
                  </Link>
                  <button onClick={() => toast.success(t("Brand.topUpSuccess"))} className="rounded-lg bg-[#3b82f6]/10 px-2.5 py-1 text-xs text-[#3b82f6] hover:bg-[#3b82f6]/20">
                    {t("Brand.topUpCampaign")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* List Approved Video */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">{t("Brand.approvedVideos")}</h3>

        {/* Platform Filter Tabs */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {platformFilterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setPlatformFilter(tab)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                platformFilter === tab
                  ? "bg-[#6c63ff] text-white"
                  : "bg-[#0d0d22] text-[#a0a0c0] hover:text-white"
              }`}
            >
              {tab === "all" ? t("Brand.filterSemua") : t(`Platform.${tab}`)}
            </button>
          ))}
        </div>

        {filteredVideos.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("Brand.noApprovedVideos")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2a2a50] text-[#a0a0c0]">
                  <th className="pb-3 pr-4 font-medium">{t("Brand.colDatePosted")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("Brand.colUsername")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("Brand.colLink")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("Brand.colSocialMedia")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("Brand.colViews")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("Brand.colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="border-b border-[#2a2a50]/30">
                    <td className="py-3 pr-4 text-white">
                      {video.reviewedAt ? new Date(video.reviewedAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {video.creatorImage ? (
                          <img src={video.creatorImage} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e1e3f] text-[10px] text-[#a0a0c0]">
                            {video.creatorName.charAt(0)}
                          </div>
                        )}
                        <span className="text-white">{video.creatorName}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {video.platformLink ? (
                        <a href={video.platformLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#6c63ff] hover:underline">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-[#6b7280]">-</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded bg-[#1e1e3f] px-2 py-0.5 text-xs text-[#a0a0c0]">
                        {t(`Platform.${video.platform || "TIKTOK"}`)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-white">{formatCompactNumber(video.views)}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-[#10b981]/10 px-2.5 py-0.5 text-xs font-medium text-[#10b981]">
                        {t("Brand.approved")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Submissions (PENDING only) */}
      {data.recentSubmissions.filter((s) => s.status === "PENDING").length > 0 && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("Brand.recentSubmissions")}</h3>
          <div className="space-y-3">
            {data.recentSubmissions.filter((s) => s.status === "PENDING").map((sub) => (
              <div key={sub.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                <div>
                  <p className="font-medium text-white">{sub.creatorName}</p>
                  <p className="text-xs text-[#a0a0c0]">{sub.campaignTitle}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#a0a0c0]">{formatCompactNumber(sub.views)} {t("Brand.colViews")}</span>
                  <span className="rounded-full bg-[#f59e0b]/10 px-3 py-1 text-xs font-medium text-[#f59e0b]">
                    {t("Brand.pending")}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleReview(sub.id, "APPROVED")} className="rounded-lg p-1.5 text-[#10b981] hover:bg-[#10b981]/10" aria-label={t("Brand.approved")}>
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleReview(sub.id, "REJECTED")} className="rounded-lg p-1.5 text-[#ef4444] hover:bg-[#ef4444]/10" aria-label={t("Brand.rejected")}>
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
