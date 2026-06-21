"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Users, Loader2 } from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { getBrandAnalytics } from "@/actions/analytics.actions";

type AnalyticsData = {
  totalReach: number;
  engagementRate: number;
  costPerView: number;
  activeCreators: number;
  topCampaigns: { name: string; views: number; creators: number; roi: number }[];
};

export default function BrandAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="text-[#8888aa]">Pantau performa campaign brand kamu.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Reach", value: formatCompactNumber(data.totalReach), icon: <BarChart3 className="h-5 w-5" /> },
          { label: "Engagement Rate", value: `${data.engagementRate.toFixed(1)}/creator`, icon: <TrendingUp className="h-5 w-5" /> },
          { label: "Cost per View", value: `Rp ${formatCompactNumber(data.costPerView)}`, icon: <DollarSign className="h-5 w-5" /> },
          { label: "Active Creators", value: String(data.activeCreators), icon: <Users className="h-5 w-5" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c63ff]/10 text-[#6c63ff]">{s.icon}</div>
              <span className="text-sm text-[#8888aa]">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Top Performing Campaigns</h3>
        {data.topCampaigns.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8888aa]">Belum ada data campaign.</p>
        ) : (
          <div className="space-y-4">
            {data.topCampaigns.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                <div>
                  <p className="font-medium text-white">{c.name}</p>
                  <p className="text-xs text-[#8888aa]">{formatCompactNumber(c.views)} views &middot; {c.creators} creators</p>
                </div>
                <div className="text-lg font-bold text-[#10b981]">{c.roi}% ROI</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
