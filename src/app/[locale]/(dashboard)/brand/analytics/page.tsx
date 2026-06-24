"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { getBrandAnalytics } from "@/actions/analytics.actions";

const PLATFORM_COLORS: Record<string, string> = {
  TIKTOK: "#6c63ff",
  INSTAGRAM: "#e4405f",
  YOUTUBE: "#ff0000",
};

type PlatformDist = {
  platform: string;
  count: number;
  percent: number;
};

type ApprovedVideo = {
  id: string;
  creatorName: string;
  campaignTitle: string;
  videoUrl: string | null;
  platformLink: string | null;
  platform: string | null;
  views: number;
  reviewedAt: string | null;
  status: string;
};

type AnalyticsData = {
  totalViews: number;
  totalBudget: number;
  spent: number;
  remaining: number;
  budgetPercent: number;
  costPerView: number;
  cpmEffective: number;
  cpmOriginal: number;
  totalReach: number;
  engagementRate: number;
  activeCreators: number;
  totalSubmissions: number;
  topCampaigns: { name: string; views: number; creators: number; roi: number }[];
  statusCounts: { approved: number; pending: number; rejected: number };
  platformDistribution: PlatformDist[];
  approvedVideos: ApprovedVideo[];
};

export default function BrandAnalytics() {
  const t = useTranslations();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformTab, setPlatformTab] = useState<string>("all");
  const [toggleTotal, setToggleTotal] = useState<"total" | "growth">("total");

  useEffect(() => {
    getBrandAnalytics()
      .then((d) => setData(d as unknown as AnalyticsData))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
      </div>
    );
  }

  if (!data) return null;

  const platformTabs = ["all", "TIKTOK", "INSTAGRAM", "YOUTUBE"];

  const filteredVideos = platformTab === "all"
    ? data.approvedVideos
    : data.approvedVideos.filter((v) => v.platform === platformTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t("BrandAnalytics.title")}</h2>
          <p className="text-[#a0a0c0]">{t("BrandAnalytics.subtitle")}</p>
        </div>
        <button
          onClick={() => {}}
          className="rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-2 text-sm text-[#a0a0c0] hover:text-white transition-colors"
        >
          {t("BrandAnalytics.exportCsv")}
        </button>
      </div>

      {/* Budget Bar */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm text-[#a0a0c0]">{t("BrandAnalytics.totalBudget")}: </span>
            <span className="text-sm font-semibold text-white">{formatCurrency(data.totalBudget)}</span>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-[#a0a0c0]">{t("BrandAnalytics.spent")}: <span className="text-[#ef4444]">{formatCurrency(data.spent)}</span></span>
            <span className="text-[#a0a0c0]">{t("BrandAnalytics.remaining")}: <span className="text-[#10b981]">{data.budgetPercent}%</span></span>
          </div>
        </div>
        <div className="h-2.5 w-full rounded-full bg-[#0d0d22]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]"
            style={{ width: `${Math.min(data.budgetPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Eye className="h-5 w-5" />, label: t("BrandAnalytics.totalViews"), value: formatCompactNumber(data.totalViews) },
          { icon: <DollarSign className="h-5 w-5" />, label: t("BrandAnalytics.spent"), value: formatCurrency(data.spent) },
          {
            icon: <BarChart3 className="h-5 w-5" />,
            label: t("BrandAnalytics.cpm"),
            value: (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#10b981]">Rp {data.cpmEffective.toLocaleString()} {t("BrandAnalytics.cpmEffective")}</span>
                <span className="text-xs text-[#a0a0c0]">Rp {data.cpmOriginal.toLocaleString()} {t("BrandAnalytics.cpmOriginal")}</span>
              </div>
            ),
          },
          { icon: <TrendingUp className="h-5 w-5" />, label: t("BrandAnalytics.statusSubmission"), value: String(data.totalSubmissions) },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c63ff]/10 text-[#6c63ff]">{s.icon}</div>
              <span className="text-sm text-[#a0a0c0]">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Statistik Section */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{t("BrandAnalytics.statisticTitle")}</h3>
          <div className="flex gap-1 rounded-lg bg-[#0d0d22] p-0.5">
            <button
              onClick={() => setToggleTotal("total")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                toggleTotal === "total" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0]"
              }`}
            >
              {t("BrandAnalytics.totalToggle")}
            </button>
            <button
              onClick={() => setToggleTotal("growth")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                toggleTotal === "growth" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0]"
              }`}
            >
              {t("BrandAnalytics.growthToggle")}
            </button>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {platformTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setPlatformTab(tab)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                platformTab === tab ? "bg-[#6c63ff] text-white" : "bg-[#0d0d22] text-[#a0a0c0] hover:text-white"
              }`}
            >
              {tab === "all" ? t("Brand.filterSemua") : t(`Platform.${tab}`)}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: t("BrandAnalytics.subViews"), value: formatCompactNumber(data.totalViews) },
            { label: t("BrandAnalytics.subLikes"), value: "-" },
            { label: t("BrandAnalytics.subComments"), value: "-" },
            { label: t("BrandAnalytics.subEngRate"), value: `${data.engagementRate}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-[#0d0d22] p-3 text-center">
              <div className="text-xs text-[#a0a0c0]">{s.label}</div>
              <div className="mt-1 text-lg font-bold text-white">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribusi Video */}
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("BrandAnalytics.videoDistribution")}</h3>
          {data.platformDistribution.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("BrandAnalytics.emptyData")}</p>
          ) : (
            <div className="space-y-3">
              {data.platformDistribution.map((pd) => (
                <div key={pd.platform}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-[#a0a0c0]">{t(`Platform.${pd.platform}`)}</span>
                    <span className="text-white font-medium">{pd.percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#0d0d22]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pd.percent}%`,
                        backgroundColor: PLATFORM_COLORS[pd.platform] || "#6c63ff",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Submission */}
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("BrandAnalytics.statusSubmission")}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
              <span className="text-[#a0a0c0]">{t("Brand.approved")}</span>
              <span className="text-lg font-bold text-[#10b981]">{data.statusCounts.approved}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
              <span className="text-[#a0a0c0]">{t("Brand.pending")}</span>
              <span className="text-lg font-bold text-[#f59e0b]">{data.statusCounts.pending}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
              <span className="text-[#a0a0c0]">{t("Brand.rejected")}</span>
              <span className="text-lg font-bold text-[#ef4444]">{data.statusCounts.rejected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Efisiensi Budget */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">{t("BrandAnalytics.budgetEfficiency")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[#0d0d22] p-4">
            <div className="text-sm text-[#a0a0c0]">{t("BrandAnalytics.cpmOriginal")}</div>
            <div className="mt-1 text-2xl font-bold text-[#6c63ff]">Rp {data.cpmOriginal.toLocaleString()}</div>
          </div>
          <div className="rounded-xl bg-[#0d0d22] p-4">
            <div className="text-sm text-[#a0a0c0]">{t("BrandAnalytics.cpmEffective")}</div>
            <div className="mt-1 text-2xl font-bold text-[#10b981]">Rp {data.cpmEffective.toLocaleString()}</div>
            <div className="mt-1 text-xs text-[#a0a0c0]">
              {data.cpmOriginal > 0 ? t("BrandAnalytics.cpmEfficiency", { percent: Math.round((1 - data.cpmEffective / data.cpmOriginal) * 100) }) : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Approved Videos Table */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">{t("BrandAnalytics.approvedVideos")}</h3>
        {filteredVideos.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("BrandAnalytics.noApprovedVideos")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2a2a50] text-[#a0a0c0]">
                  <th className="pb-3 pr-4 font-medium">{t("BrandAnalytics.colDatePosted")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("BrandAnalytics.colCreator")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("BrandAnalytics.colLink")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("BrandAnalytics.colPlatform")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("BrandAnalytics.colViews")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("BrandAnalytics.colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="border-b border-[#2a2a50]/30">
                    <td className="py-3 pr-4 text-white">
                      {video.reviewedAt ? new Date(video.reviewedAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-3 pr-4 text-white">{video.creatorName}</td>
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
    </div>
  );
}
