"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { getAgencyOverview } from "@/actions/agency.actions";

type AgencyData = {
  agencyName: string;
  commissionRate: number;
  totalMembers: number;
  totalViews: number;
  totalEarnings: number;
  commission: number;
  members: { id: string; name: string; trustScore: number; totalViews: number; totalEarnings: number }[];
};

export default function AgencyOverview() {
  const [data, setData] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgencyOverview()
      .then((d) => setData(d as unknown as AgencyData))
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
        <h2 className="text-2xl font-bold text-white">Agency Dashboard</h2>
        <p className="text-[#8888aa]">Kelola tim kreator kamu dari satu tempat.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Members", value: String(data.totalMembers), icon: <Users className="h-5 w-5" /> },
          { label: "Total Views", value: formatCompactNumber(data.totalViews), icon: <TrendingUp className="h-5 w-5" /> },
          { label: "Total Earnings", value: formatCurrency(data.totalEarnings), icon: <DollarSign className="h-5 w-5" /> },
          { label: `Commission (${data.commissionRate}%)`, value: formatCurrency(data.commission), icon: <DollarSign className="h-5 w-5" /> },
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
        <h3 className="mb-4 text-lg font-semibold text-white">Members</h3>
        {data.members.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8888aa]">Belum ada member.</p>
        ) : (
          <div className="space-y-3">
            {data.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                <div>
                  <p className="font-medium text-white">{m.name}</p>
                  <p className="text-xs text-[#8888aa]">Trust Score: {m.trustScore} &middot; {formatCompactNumber(m.totalViews)} views</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#10b981]">{formatCurrency(m.totalEarnings)}</p>
                  <p className="text-xs text-[#8888aa]">Commission: {formatCurrency(Math.round(m.totalEarnings * data.commissionRate / 100))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
