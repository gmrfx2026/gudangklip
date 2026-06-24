"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Loader2, Eye, EyeOff, RefreshCw, ChevronDown, CheckCircle,
  TrendingUp, Wallet, Star, CircleDollarSign, Video, Megaphone,
} from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { PLATFORMS, CATEGORIES, TRUST_SCORE_THRESHOLDS } from "@/lib/constants";
import { getCreatorOverview } from "@/actions/creator.actions";
import { getActiveCampaigns } from "@/actions/campaign.actions";
import { getCreatorJoinedCampaignIds } from "@/actions/creator.actions";
import { getCreatorSubmissions } from "@/actions/submission.actions";
import { joinCampaign } from "@/actions/auth.actions";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

type OverviewData = Awaited<ReturnType<typeof getCreatorOverview>>;

type CampaignItem = {
  id: string;
  title: string;
  category: string;
  cpmRate: number;
  totalBudget: number;
  remainingBudget: number;
  brand: { name: string | null; image: string | null };
  _count: { participants: number; submissions: number };
};

type SubmissionItem = {
  id: string;
  status: string;
  platform: string | null;
  campaignId: string;
  campaign: { title: string; cpmRate: number };
  viewLogs: { views: number }[];
};

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_FILTER_I18N: Record<StatusFilter, string> = {
  ALL: "filterAll",
  PENDING: "filterPending",
  APPROVED: "filterApproved",
  REJECTED: "filterRejected",
};

function generateChartData() {
  const data = [];
  const now = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      earnings: 0,
    });
  }
  return data;
}

function getTrustTier(score: number): { tier: "gold" | "silver" | "bronze" | "unverified"; labelKey: string; color: string } {
  if (score >= TRUST_SCORE_THRESHOLDS.GOLD) return { tier: "gold", labelKey: "trustGold", color: "bg-[#f59e0b]/10 text-[#f59e0b]" };
  if (score >= TRUST_SCORE_THRESHOLDS.SILVER) return { tier: "silver", labelKey: "trustSilver", color: "bg-[#94a3b8]/10 text-[#94a3b8]" };
  if (score >= TRUST_SCORE_THRESHOLDS.BRONZE) return { tier: "bronze", labelKey: "trustBronze", color: "bg-[#e8833a]/10 text-[#e8833a]" };
  return { tier: "unverified", labelKey: "trustUnverified", color: "bg-[#6b7280]/10 text-[#6b7280]" };
}

export default function ClipperDashboard() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [chartView, setChartView] = useState<"total" | "increase">("total");

  const chartData = generateChartData();

  useEffect(() => {
    Promise.all([
      getCreatorOverview(),
      getActiveCampaigns(),
      getCreatorJoinedCampaignIds(),
      getCreatorSubmissions(),
    ])
      .then(([o, c, ids, s]) => {
        setOverview(o);
        setCampaigns(c as unknown as CampaignItem[]);
        setJoinedIds(ids);
        setSubmissions(s as unknown as SubmissionItem[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (campaignId: string) => {
    setJoining(campaignId);
    try {
      await joinCampaign(campaignId);
      toast.success(t("CreatorOverview.toastJoinSuccess"));
      setJoinedIds((prev) => [...prev, campaignId]);
      const o = await getCreatorOverview();
      setOverview(o);
    } catch (err: any) {
      toast.error(err.message || t("CreatorOverview.toastJoinFailed"));
    } finally {
      setJoining(null);
    }
  };

  const totalViews = submissions.reduce(
    (sum, s) => sum + s.viewLogs.reduce((v, vl) => v + vl.views, 0),
    0
  );

  const filteredSubmissions =
    statusFilter === "ALL"
      ? submissions
      : submissions.filter((s) => s.status === statusFilter);

  const trustTier = getTrustTier(overview?.trustScore ?? 0);

  // Compute onboarding steps
  const onboardingDone = [
    !!(session?.user?.name && session?.user?.name.length > 0), // step 1: profile
    false, // step 2: social media - would need social accounts data
    (overview?.activeCampaigns ?? 0) > 0, // step 3: joined campaign
    submissions.length > 0, // step 4: submitted video
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
      </div>
    );
  }

  const userName = session?.user?.name?.split(" ")[0] || t("Role.CREATOR");

  return (
    <div className="space-y-6">
      {/* Welcome Header with Trust Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("CreatorOverview.welcome", { name: userName })}
          </h1>
          <p className="text-sm text-[#a0a0c0]">{t("CreatorOverview.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${trustTier.color}`}
          >
            <Star className="h-3.5 w-3.5" />
            {t(`CreatorOverview.${trustTier.labelKey}` as any)}
          </span>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c63ff]/10 text-[#6c63ff]">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <span className="text-sm text-[#a0a0c0]">{t("CreatorOverview.balance")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-white">
              {showBalance ? formatCurrency(overview?.walletBalance ?? 0) : t("CreatorOverview.balanceHidden")}
            </span>
            <button onClick={() => setShowBalance(!showBalance)} className="text-[#a0a0c0] hover:text-white">
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-sm text-[#a0a0c0]">{t("CreatorOverview.totalEarnings")}</span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(overview?.totalEarnings ?? 0)}
          </div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b82f6]/10 text-[#3b82f6]">
              <Eye className="h-5 w-5" />
            </div>
            <span className="text-sm text-[#a0a0c0]">{t("CreatorOverview.totalViews")}</span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatCompactNumber(totalViews)} <span className="text-sm font-normal text-[#a0a0c0]">{t("BrandAnalytics.subViews")}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b]">
              <Video className="h-5 w-5" />
            </div>
            <span className="text-sm text-[#a0a0c0]">{t("CreatorOverview.totalVideos")}</span>
          </div>
          <div className="text-xl font-bold text-white">
            {submissions.length} <span className="text-sm font-normal text-[#a0a0c0]">{t("CreatorOverview.totalVideos")}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef4444]/10 text-[#ef4444]">
              <Megaphone className="h-5 w-5" />
            </div>
            <span className="text-sm text-[#a0a0c0]">{t("CreatorOverview.activeCampaigns")}</span>
          </div>
          <div className="text-xl font-bold text-white">
            {overview?.activeCampaigns ?? 0} <span className="text-sm font-normal text-[#a0a0c0]">{t("CreatorOverview.activeCampaigns")}</span>
          </div>
        </div>
      </div>

      {/* Onboarding */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{t("CreatorOverview.onboarding")}</h2>
            <p className="text-sm text-[#a0a0c0]">{t("CreatorOverview.onboardingDesc")}</p>
          </div>
          <span className="rounded-full bg-[#6c63ff]/10 px-3 py-1 text-sm font-medium text-[#6c63ff]">
            {t("CreatorOverview.onboardingCompleted", { done: onboardingDone })}
          </span>
        </div>
        <div className="space-y-3">
          {[
            { label: t("CreatorOverview.onboardingStep1"), done: !!(session?.user?.name && session?.user?.name.length > 0) },
            { label: t("CreatorOverview.onboardingStep2"), done: false },
            { label: t("CreatorOverview.onboardingStep3"), done: (overview?.activeCampaigns ?? 0) > 0 },
            { label: t("CreatorOverview.onboardingStep4"), done: submissions.length > 0 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-[#2a2a50]/50 bg-[#0d0d22] p-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  item.done ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#6c63ff]/10 text-[#6c63ff]"
                }`}
              >
                {item.done ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-bold">{i + 1}</span>
                )}
              </div>
              <span className={`flex-1 text-sm ${item.done ? "text-[#a0a0c0] line-through" : "text-white"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("CreatorOverview.analyticsTitle")}</h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[#2a2a50] p-0.5">
              <button
                onClick={() => setChartView("total")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  chartView === "total" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"
                }`}
              >
                {t("CreatorOverview.total")}
              </button>
              <button
                onClick={() => setChartView("increase")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  chartView === "increase" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"
                }`}
              >
                {t("CreatorOverview.increase")}
              </button>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f]">
              {t("CreatorOverview.last28Days")} <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a50" />
            <XAxis dataKey="date" tick={{ fill: "#a0a0c0", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#a0a0c0", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rp${v / 1000}K`} />
            <Tooltip contentStyle={{ backgroundColor: "#111128", border: "1px solid #2a2a50", borderRadius: "8px" }} />
            <Line type="monotone" dataKey="earnings" stroke="#6c63ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Your Videos */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("CreatorOverview.videoSection")}</h2>
          <button className="flex items-center gap-2 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f]">
            <RefreshCw className="h-3.5 w-3.5" />
            {t("CreatorOverview.refreshViews")}
          </button>
        </div>
        {/* Status filter pills */}
        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f
                  ? "bg-[#6c63ff] text-white"
                  : "text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white"
              }`}
            >
              {t(`CreatorOverview.${STATUS_FILTER_I18N[f]}` as any)}
            </button>
          ))}
        </div>
        <div className="mb-4 flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0]">
            {t("CreatorOverview.allCampaigns")} <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0]">
            {t("CreatorOverview.sortBy")} <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        {filteredSubmissions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#6b7280]">{t("CreatorOverview.emptyVideos")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map((sub) => {
              const subViews = sub.viewLogs.reduce((s, v) => s + v.views, 0);
              return (
                <div key={sub.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                  <div>
                    <p className="text-sm font-medium text-white">{sub.campaign?.title || t("CreatorOverview.unknownCampaign")}</p>
                    <p className="text-xs text-[#a0a0c0]">{sub.platform || t("CreatorOverview.unknownPlatform")}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-white">{formatCompactNumber(subViews)} {t("CreatorOverview.views")}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        sub.status === "APPROVED"
                          ? "bg-[#10b981]/10 text-[#10b981]"
                          : sub.status === "REJECTED"
                            ? "bg-[#ef4444]/10 text-[#ef4444]"
                            : "bg-[#f59e0b]/10 text-[#f59e0b]"
                      }`}
                    >
                      {sub.status === "APPROVED"
                        ? t("CreatorOverview.filterApproved")
                        : sub.status === "REJECTED"
                          ? t("CreatorOverview.filterRejected")
                          : t("CreatorOverview.filterPending")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Campaigns Grid */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("CreatorOverview.activeCampaignsTitle")}</h2>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0]">
            {t("CreatorOverview.sortBy")} <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0]">
            {t("CreatorOverview.filterByCategory")} <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0]">
            {t("CreatorOverview.filterByType")} <ChevronDown className="h-3 w-3" />
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] bg-[#1e1e3f]/50 px-3 py-1.5 text-xs text-white"
            >
              {t(`Platform.${p.value}` as any)}
            </button>
          ))}
        </div>
        {campaigns.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#6b7280]">{t("CreatorOverview.emptyCampaigns")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => {
              const isJoined = joinedIds.includes(c.id);
              const budgetPercent =
                c.totalBudget > 0 ? Math.round((c.remainingBudget / c.totalBudget) * 100) : 100;
              const catLabel = t(`Category.${c.category}` as any);
              return (
                <div
                  key={c.id}
                  className="overflow-hidden rounded-2xl border border-[#2a2a50] bg-[#111128]/50 transition-all hover:border-[#6c63ff]/50"
                >
                  <div className="p-5">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e1e3f] text-sm font-bold text-[#6c63ff]">
                        {c.brand?.name?.charAt(0) || t("CreatorCampaignDetail.unknownBrandInitial")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-white">{c.brand?.name || t("CreatorOverview.unknownBrand")}</span>
                          <span className="rounded bg-[#6c63ff]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#6c63ff]">
                            {t("CreatorOverview.clipping")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white">{c.title}</h3>
                    <div className="mb-1 text-sm font-bold text-[#10b981]">
                      {formatCurrency(c.cpmRate)}{" "}
                      <span className="text-xs font-normal text-[#a0a0c0]">{t("CreatorOverview.perKViews")}</span>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-[#1e1e3f] px-2 py-0.5 text-[10px] text-[#a0a0c0]">{catLabel}</span>
                    </div>
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-[#a0a0c0]">{t("CreatorOverview.remainingBudget")}</span>
                        <span className="text-white">{budgetPercent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1a1a35]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]"
                          style={{ width: `${budgetPercent}%` }}
                        />
                      </div>
                    </div>
                    {isJoined ? (
                      <Link
                        href={`/clipper/campaigns/${c.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10b981]/20 py-2.5 text-sm font-semibold text-[#10b981] transition-colors hover:bg-[#10b981]/30"
                      >
                        {t("CreatorOverview.joined")}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleJoin(c.id)}
                        disabled={joining === c.id}
                        className="w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {joining === c.id ? t("CreatorOverview.joining") : t("CreatorOverview.joinCampaign")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
