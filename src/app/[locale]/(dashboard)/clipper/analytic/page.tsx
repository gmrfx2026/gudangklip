"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";
import { getCreatorOverview } from "@/actions/creator.actions";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

type OverviewData = {
  walletBalance: number;
  totalViews: number;
  totalEarnings: number;
  submissionsCount: number;
  activeCampaigns: number;
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

export default function ClipperAnalytic() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState<"Total" | "Kenaikan">("Total");

  const chartData = generateChartData();

  useEffect(() => {
    getCreatorOverview()
      .then((d) => setData(d as unknown as OverviewData))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analitik Performa Kamu</h1>
        <button className="flex items-center gap-2 rounded-xl border border-[#2a2a50] px-4 py-2 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f]">
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-2 text-sm text-[#a0a0c0]">Total Views</div>
          <div className="text-2xl font-bold text-white">
            {formatCompactNumber(data?.totalViews ?? 0)} <span className="text-sm font-normal text-[#a0a0c0]">Views</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-2 text-sm text-[#a0a0c0]">Total Campaign</div>
          <div className="text-2xl font-bold text-white">
            {data?.activeCampaigns ?? 0} <span className="text-sm font-normal text-[#a0a0c0]">Campaign</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-2 text-sm text-[#a0a0c0]">Total Video</div>
          <div className="text-2xl font-bold text-white">
            {data?.submissionsCount ?? 0} <span className="text-sm font-normal text-[#a0a0c0]">Video</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
          <div className="mb-2 text-sm text-[#a0a0c0]">Total Approved</div>
          <div className="text-2xl font-bold text-white">
            0 <span className="text-sm font-normal text-[#a0a0c0]">Videos</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Total Views</h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[#2a2a50] p-0.5">
              <button
                onClick={() => setChartView("Total")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${chartView === "Total" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0]"}`}
              >Total</button>
              <button
                onClick={() => setChartView("Kenaikan")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${chartView === "Kenaikan" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0]"}`}
              >Kenaikan</button>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a50" />
            <XAxis dataKey="date" tick={{ fill: "#a0a0c0", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#a0a0c0", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "#111128", border: "1px solid #2a2a50", borderRadius: "8px" }} />
            <Line type="monotone" dataKey="views" stroke="#6c63ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
