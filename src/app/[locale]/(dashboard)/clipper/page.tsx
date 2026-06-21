"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Loader2, Eye, EyeOff, RefreshCw, Search, ChevronDown } from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { PLATFORMS, CATEGORIES } from "@/lib/constants";
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

type OverviewData = {
  walletBalance: number;
  totalViews: number;
  totalEarnings: number;
  trustScore: number;
  submissionsCount: number;
  activeCampaigns: number;
};

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

const statusFilters = ["Semua", "Pending", "Approved", "Rejected", "Deleted"] as const;

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

export default function ClipperDashboard() {
  const { data: session } = useSession();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [showEarnings, setShowEarnings] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [chartView, setChartView] = useState<"Total" | "Kenaikan">("Total");

  const chartData = generateChartData();

  useEffect(() => {
    Promise.all([
      getCreatorOverview(),
      getActiveCampaigns(),
      getCreatorJoinedCampaignIds(),
      getCreatorSubmissions(),
    ])
      .then(([o, c, ids, s]) => {
        setOverview(o as unknown as OverviewData);
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
      toast.success("Berhasil join campaign!");
      setJoinedIds((prev) => [...prev, campaignId]);
      const o = await getCreatorOverview();
      setOverview(o as unknown as OverviewData);
    } catch (err: any) {
      toast.error(err.message || "Gagal join campaign");
    } finally {
      setJoining(null);
    }
  };

  const totalViews = submissions.reduce(
    (sum, s) => sum + s.viewLogs.reduce((v, vl) => v + vl.views, 0), 0
  );

  const filteredSubmissions = statusFilter === "Semua"
    ? submissions
    : submissions.filter((s) => s.status.toUpperCase() === statusFilter.toUpperCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Selamat datang, {session?.user?.name?.split(" ")[0] || "Clipper"}
        </h1>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-[#a0a0c0]">Total Pendapatan</span>
            <button onClick={() => setShowEarnings(!showEarnings)} className="text-[#a0a0c0] hover:text-white">
              {showEarnings ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-2xl font-bold text-white">
            {showEarnings ? formatCurrency(overview?.totalEarnings ?? 0) : "Rp••••••"}
          </div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-2 text-sm text-[#a0a0c0]">Bisa Dicairkan</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(overview?.walletBalance ?? 0)}</div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-2 text-sm text-[#a0a0c0]">Total Views</div>
          <div className="text-2xl font-bold text-white">
            {formatCompactNumber(totalViews)} <span className="text-sm font-normal text-[#a0a0c0]">Views</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-2 text-sm text-[#a0a0c0]">Total Video</div>
          <div className="text-2xl font-bold text-white">
            {submissions.length} <span className="text-sm font-normal text-[#a0a0c0]">Video</span>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Analitik Pendapatan</h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[#2a2a50] p-0.5">
              <button
                onClick={() => setChartView("Total")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  chartView === "Total" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"
                }`}
              >Total</button>
              <button
                onClick={() => setChartView("Kenaikan")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  chartView === "Kenaikan" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"
                }`}
              >Kenaikan</button>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f]">
              28 hari terakhir <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a50" />
            <XAxis dataKey="date" tick={{ fill: "#a0a0c0", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#a0a0c0", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rp${v/1000}K`} />
            <Tooltip contentStyle={{ backgroundColor: "#111128", border: "1px solid #2a2a50", borderRadius: "8px" }} />
            <Line type="monotone" dataKey="earnings" stroke="#6c63ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Video Kamu */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Video Kamu</h2>
          <button className="flex items-center gap-2 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f]">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Views
          </button>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white"
              }`}
            >{f}</button>
          ))}
        </div>
        <div className="mb-4 flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0]">
            Semua campaign <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0]">
            Urutkan dari <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        {filteredSubmissions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#6b7280]">Belum ada submission untuk campaign ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                <div>
                  <p className="font-medium text-white text-sm">{sub.campaign?.title || "Campaign"}</p>
                  <p className="text-xs text-[#a0a0c0]">{sub.platform || "Unknown"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white">
                    {formatCompactNumber(sub.viewLogs.reduce((s, v) => s + v.views, 0))} views
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    sub.status === "APPROVED" ? "bg-[#10b981]/10 text-[#10b981]" :
                    sub.status === "REJECTED" ? "bg-[#ef4444]/10 text-[#ef4444]" :
                    "bg-[#f59e0b]/10 text-[#f59e0b]"
                  }`}>{sub.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Semua Campaign Aktif */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Semua Campaign Aktif</h2>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0]">
            Urutkan dari <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0]">
            Kategori <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0]">
            Tipe <ChevronDown className="h-3 w-3" />
          </button>
          {PLATFORMS.map((p) => (
            <button key={p.value} className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] bg-[#1e1e3f]/50 px-3 py-1.5 text-xs text-white">
              {p.label}
            </button>
          ))}
        </div>
        {campaigns.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#6b7280]">Belum ada campaign aktif saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => {
              const isJoined = joinedIds.includes(c.id);
              const budgetPercent = c.totalBudget > 0
                ? Math.round((c.remainingBudget / c.totalBudget) * 100)
                : 100;
              const catLabel = CATEGORIES.find((cat) => cat.value === c.category)?.label || c.category;
              return (
                <div key={c.id} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden hover:border-[#6c63ff]/50 transition-all">
                  <div className="p-5">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e1e3f] text-sm font-bold text-[#6c63ff]">
                        {c.brand?.name?.charAt(0) || "B"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{c.brand?.name || "Brand"}</span>
                          <span className="rounded bg-[#6c63ff]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#6c63ff]">CLIPPING</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white">{c.title}</h3>
                    <div className="mb-1 text-sm font-bold text-[#10b981]">
                      Rp{c.cpmRate.toLocaleString()} <span className="font-normal text-xs text-[#a0a0c0]">/ 1K views</span>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-[#1e1e3f] px-2 py-0.5 text-[10px] text-[#a0a0c0]">{catLabel}</span>
                    </div>
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-[#a0a0c0]">Budget Tersisa</span>
                        <span className="text-white">{budgetPercent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1a1a35]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]" style={{ width: `${budgetPercent}%` }} />
                      </div>
                    </div>
                    {isJoined ? (
                      <Link
                        href={`/clipper/campaigns/${c.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10b981]/20 py-2.5 text-sm font-semibold text-[#10b981] hover:bg-[#10b981]/30 transition-colors"
                      >
                        Joined
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleJoin(c.id)}
                        disabled={joining === c.id}
                        className="w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {joining === c.id ? "Joining..." : "Join Campaign"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Onboarding Progress */}
      <button className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-xl border border-[#2a2a50] bg-[#111128]/90 px-4 py-3 shadow-lg backdrop-blur-sm hover:border-[#6c63ff]/50 transition-colors">
        <span className="text-xs font-medium text-white">Onboarding Progress</span>
        <span className="text-xs text-[#a0a0c0]">0/4 steps completed</span>
      </button>
    </div>
  );
}
