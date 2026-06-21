"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp, Wallet, Video, Star, Loader2 } from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { getCreatorOverview } from "@/actions/creator.actions";

type OverviewData = {
  walletBalance: number;
  totalViews: number;
  totalEarnings: number;
  trustScore: number;
  submissionsCount: number;
  activeCampaigns: number;
};

export default function CreatorOverview() {
  const { data: session } = useSession();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (!data) return null;

  const trustLabel =
    data.trustScore >= 85 ? "Gold" : data.trustScore >= 60 ? "Silver" : data.trustScore >= 30 ? "Bronze" : "Belum terverifikasi";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <p className="text-[#8888aa]">Pantau performa dan pendapatan kamu.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Wallet className="h-5 w-5" />, label: "Saldo", value: formatCurrency(data.walletBalance) },
          { icon: <TrendingUp className="h-5 w-5" />, label: "Total Views", value: formatCompactNumber(data.totalViews) },
          { icon: <Video className="h-5 w-5" />, label: "Submissions", value: `${data.submissionsCount} (${data.activeCampaigns} active)` },
          { icon: <Star className="h-5 w-5" />, label: "Trust Score", value: `${data.trustScore} - ${trustLabel}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c63ff]/10 text-[#6c63ff]">
                {stat.icon}
              </div>
              <span className="text-sm text-[#8888aa]">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Mulai Hasilkan Cuan!</h3>
        <p className="mb-4 text-[#8888aa]">
          Explore campaign yang tersedia, join, upload clip terbaik kamu, dan dapatkan cuan dari setiap views.
        </p>
        <div className="flex gap-4">
          <a href="/creator/explore" className="rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
            Explore Campaigns
          </a>
          <a href="/creator/wallet" className="rounded-xl border border-[#2a2a50] px-5 py-2.5 text-sm font-medium text-[#e8e8f0] hover:bg-[#1e1e3f]/50 transition-colors">
            Lihat Wallet
          </a>
        </div>
      </div>
    </div>
  );
}
