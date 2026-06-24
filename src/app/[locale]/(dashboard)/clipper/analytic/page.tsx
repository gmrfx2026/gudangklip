"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Download, Eye, TrendingUp, DollarSign, Video, CheckCircle, Megaphone } from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { getCreatorOverview } from "@/actions/creator.actions";
import { getCreatorSubmissions } from "@/actions/submission.actions";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";

type OverviewData = Awaited<ReturnType<typeof getCreatorOverview>>;

type SubmissionItem = {
  id: string;
  status: string;
  platform: string | null;
  campaignId: string;
  campaign: { title: string; cpmRate: number };
  viewLogs: { views: number }[];
};

const PLATFORM_COLORS: Record<string, string> = {
  TIKTOK: "#6c63ff",
  INSTAGRAM: "#e4405f",
  YOUTUBE: "#ff0000",
};

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#10b981",
  PENDING: "#f59e0b",
  REJECTED: "#ef4444",
};

function generateChartData() {
  const data = [];
  const now = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      views: 0,
    });
  }
  return data;
}

export default function ClipperAnalytics() {
  const t = useTranslations();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartToggle, setChartToggle] = useState<"total" | "growth">("total");
  const [platformTab, setPlatformTab] = useState<string>("ALL");

  const chartData = generateChartData();

  useEffect(() => {
    Promise.all([getCreatorOverview(), getCreatorSubmissions()])
      .then(([o, s]) => {
        setOverview(o);
        setSubmissions(s as unknown as SubmissionItem[]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
      </div>
    );
  }

  // Computed stats
  const totalViews = submissions.reduce((sum, s) => sum + s.viewLogs.reduce((v, vl) => v + vl.views, 0), 0);
  const approvedSubmissions = submissions.filter((s) => s.status === "APPROVED");
  const approvedViews = approvedSubmissions.reduce((sum, s) => sum + s.viewLogs.reduce((v, vl) => v + vl.views, 0), 0);
  const avgViewsPerVideo = submissions.length > 0 ? Math.round(totalViews / submissions.length) : 0;

  // Status breakdown
  const statusCounts = {
    approved: submissions.filter((s) => s.status === "APPROVED").length,
    pending: submissions.filter((s) => s.status === "PENDING").length,
    rejected: submissions.filter((s) => s.status === "REJECTED").length,
  };
  const statusPieData = [
    { name: "APPROVED", value: statusCounts.approved },
    { name: "PENDING", value: statusCounts.pending },
    { name: "REJECTED", value: statusCounts.rejected },
  ].filter((d) => d.value > 0);

  // Platform distribution
  const platformCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    const p = s.platform || "UNKNOWN";
    platformCounts[p] = (platformCounts[p] || 0) + 1;
  });
  const platformData = Object.entries(platformCounts).map(([platform, count]) => ({
    platform,
    count,
  }));

  // Filtered approved videos
  const filteredVideos =
    platformTab === "ALL"
      ? approvedSubmissions
      : approvedSubmissions.filter((v) => v.platform === platformTab);

  // Top video
  const topVideo = [...submissions].sort(
    (a, b) =>
      b.viewLogs.reduce((s, vl) => s + vl.views, 0) -
      a.viewLogs.reduce((s, vl) => s + vl.views, 0)
  )[0];
  const topVideoViews = topVideo ? topVideo.viewLogs.reduce((s, vl) => s + vl.views, 0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("CreatorAnalytics.title")}</h1>
          <p className="text-sm text-[#a0a0c0]">{t("CreatorAnalytics.subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-[#2a2a50] px-4 py-2 text-sm text-[#a0a0c0] hover:bg-[#1e1e3f] transition-colors">
          <Download className="h-4 w-4" />
          {t("CreatorAnalytics.exportCSV")}
        </button>
      </div>

      {/* 5 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { icon: <Eye className="h-5 w-5" />, color: "bg-[#3b82f6]/10 text-[#3b82f6]", label: t("CreatorAnalytics.totalViews"), value: formatCompactNumber(totalViews) },
          { icon: <Megaphone className="h-5 w-5" />, color: "bg-[#ef4444]/10 text-[#ef4444]", label: t("CreatorAnalytics.totalCampaigns"), value: String(overview?.activeCampaigns ?? 0) },
          { icon: <Video className="h-5 w-5" />, color: "bg-[#f59e0b]/10 text-[#f59e0b]", label: t("CreatorAnalytics.totalVideos"), value: String(submissions.length) },
          { icon: <CheckCircle className="h-5 w-5" />, color: "bg-[#10b981]/10 text-[#10b981]", label: t("CreatorAnalytics.totalApproved"), value: String(approvedSubmissions.length) },
          { icon: <DollarSign className="h-5 w-5" />, color: "bg-[#6c63ff]/10 text-[#6c63ff]", label: t("CreatorAnalytics.totalEarnings"), value: formatCurrency(overview?.totalEarnings ?? 0) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-sm text-[#a0a0c0]">{stat.label}</span>
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* CPM Info Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c63ff]/10 text-[#6c63ff]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-[#a0a0c0]">{t("CreatorAnalytics.cpmEffective")}</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(Math.round(
                  (overview?.totalEarnings ?? 0) / Math.max(totalViews / 1000, 1)
                ))}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-[#a0a0c0]">{t("CreatorAnalytics.cpmOriginal")}</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(overview?.totalEarnings ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Views Chart + Submission Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t("CreatorAnalytics.chartTitle")}</h2>
            <div className="flex rounded-lg border border-[#2a2a50] p-0.5">
              <button
                onClick={() => setChartToggle("total")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  chartToggle === "total" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"
                }`}
              >
                {t("CreatorAnalytics.totalViews")}
              </button>
              <button
                onClick={() => setChartToggle("growth")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  chartToggle === "growth" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"
                }`}
              >
                {t("CreatorAnalytics.views")}
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a50" />
              <XAxis dataKey="date" tick={{ fill: "#a0a0c0", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#a0a0c0", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompactNumber(v)} />
              <Tooltip contentStyle={{ backgroundColor: "#111128", border: "1px solid #2a2a50", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="views" stroke="#6c63ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">{t("CreatorAnalytics.statusTitle")}</h2>
          {statusPieData.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-sm text-[#6b7280]">{t("CreatorAnalytics.noData")}</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#6b7280"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 flex justify-center gap-4">
                {statusPieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] }} />
                    <span className="text-[#a0a0c0]">
                      {d.name === "APPROVED"
                        ? t("CreatorAnalytics.approved")
                        : d.name === "PENDING"
                          ? t("CreatorAnalytics.pending")
                          : t("CreatorAnalytics.rejected")}
                    </span>
                    <span className="text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Platform Distribution + Efficiency */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t("CreatorAnalytics.platformTitle")}</h2>
            <div className="flex gap-1 rounded-lg border border-[#2a2a50] p-0.5">
              <button
                onClick={() => setPlatformTab("ALL")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  platformTab === "ALL" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"
                }`}
              >
                {t("CreatorAnalytics.platformAll")}
              </button>
              {["TIKTOK", "INSTAGRAM", "YOUTUBE"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformTab(p)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    platformTab === p ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"
                  }`}
                >
                  {t(`Platform.${p}` as any)}
                </button>
              ))}
            </div>
          </div>
          {platformData.length === 0 ? (
            <div className="flex h-[150px] items-center justify-center">
              <p className="text-sm text-[#6b7280]">{t("CreatorAnalytics.noData")}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a50" />
                <XAxis dataKey="platform" tick={{ fill: "#a0a0c0", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#a0a0c0", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111128", border: "1px solid #2a2a50", borderRadius: "8px" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {platformData.map((entry) => (
                    <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] || "#6b7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">{t("CreatorAnalytics.efficiencyTitle")}</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#a0a0c0]">{t("CreatorAnalytics.avgViewsPerVideo")}</p>
              <p className="text-2xl font-bold text-white">{formatCompactNumber(avgViewsPerVideo)}</p>
            </div>
            <div className="border-t border-[#2a2a50] pt-4">
              <p className="text-sm text-[#a0a0c0]">{t("CreatorAnalytics.topVideo")}</p>
              <p className="text-lg font-semibold text-white">
                {topVideo?.campaign?.title || "-"}
              </p>
              <p className="text-xs text-[#a0a0c0]">
                {t("CreatorAnalytics.topVideoViews", { views: formatCompactNumber(topVideoViews) })}
              </p>
            </div>
            <div className="border-t border-[#2a2a50] pt-4">
              <p className="text-sm text-[#a0a0c0]">{t("CreatorAnalytics.cpmEffective")}</p>
              <p className="text-xl font-bold text-[#10b981]">
                {formatCurrency(Math.round((overview?.totalEarnings ?? 0) / Math.max(totalViews / 1000, 1)))}
              </p>
              <p className="text-xs text-[#a0a0c0]">{t("CreatorAnalytics.perKViewsEffective")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Approved Videos Table */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">{t("CreatorAnalytics.approvedVideos")}</h2>
        {filteredVideos.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("CreatorAnalytics.noApproved")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2a2a50] text-[#a0a0c0]">
                  <th className="pb-3 pr-4 font-medium">{t("CreatorAnalytics.campaignLabel")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("CreatorAnalytics.platformTitle")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("CreatorAnalytics.views")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("CreatorAnalytics.estimatedEarnings")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video, idx) => {
                  const vViews = video.viewLogs.reduce((s, vl) => s + vl.views, 0);
                  return (
                    <tr key={video.id} className="border-b border-[#2a2a50]/30">
                      <td className="py-3 pr-4 text-white">{video.campaign?.title || t("CreatorAnalytics.campaignLabel")}</td>
                      <td className="py-3 pr-4">
                      <span className="rounded bg-[#1e1e3f] px-2 py-0.5 text-xs" style={{ color: PLATFORM_COLORS[video.platform || ""] || "#a0a0c0" }}>
                        {video.platform ? t(`Platform.${video.platform}` as any) : "-"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-white">{formatCompactNumber(vViews)}</td>
                      <td className="py-3 pr-4 text-[#10b981]">
                        {formatCurrency(Math.round(vViews * (video.campaign?.cpmRate ?? 0) / 1000))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
