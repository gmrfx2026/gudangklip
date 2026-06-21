"use client";

import { useEffect, useState } from "react";
import { Search, DollarSign, Users, Loader2, Check } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { getActiveCampaigns } from "@/actions/campaign.actions";
import { joinCampaign } from "@/actions/auth.actions";
import { getCreatorJoinedCampaignIds } from "@/actions/creator.actions";
import { toast } from "sonner";

type CampaignItem = {
  id: string;
  title: string;
  category: string;
  cpmRate: number;
  totalBudget: number;
  remainingBudget: number;
  brand: { name: string | null };
  _count: { participants: number; submissions: number };
};

export default function ExploreCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [joining, setJoining] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = () => {
    getActiveCampaigns()
      .then((data) => setCampaigns(data as unknown as CampaignItem[]))
      .finally(() => setLoading(false));
    getCreatorJoinedCampaignIds()
      .then((ids) => setJoinedIds(ids));
  };

  useEffect(() => { fetchData(); }, []);

  const handleJoin = async (campaignId: string) => {
    setJoining(campaignId);
    try {
      await joinCampaign(campaignId);
      toast.success("Berhasil join campaign!");
      setJoinedIds((prev) => [...prev, campaignId]);
    } catch (err: any) {
      toast.error(err.message || "Gagal join campaign");
    } finally {
      setJoining(null);
    }
  };

  const filtered = campaigns.filter((c) => {
    if (category && c.category !== category) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Explore Campaigns</h2>
        <p className="text-[#8888aa]">Temukan campaign dari brand ternama dan mulai dapatkan cuan.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8888aa]" />
          <input
            placeholder="Cari campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCategory("")}
            className={`rounded-xl px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              !category ? "bg-[#6c63ff] text-white" : "border border-[#2a2a50] text-[#b8b8d0] hover:bg-[#1e1e3f]"
            }`}
          >
            Semua
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`rounded-xl px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat.value ? "bg-[#6c63ff] text-white" : "border border-[#2a2a50] text-[#b8b8d0] hover:bg-[#1e1e3f]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-[#8888aa]">
          <p className="text-lg">Tidak ada campaign yang tersedia.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((campaign) => {
            const isJoined = joinedIds.includes(campaign.id);
            const budgetPercent = campaign.totalBudget > 0 ? Math.round(((campaign.totalBudget - campaign.remainingBudget) / campaign.totalBudget) * 100) : 0;
            return (
              <div key={campaign.id} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden hover:border-[#6c63ff]/50 transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-[#1e1e3f] to-[#0f0f23] flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#6c63ff]/40">{campaign.title.charAt(0)}</span>
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#6c63ff]/10 px-2.5 py-0.5 text-xs font-medium text-[#6c63ff]">
                      {CATEGORIES.find((c) => c.value === campaign.category)?.label}
                    </span>
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-white">{campaign.title}</h3>
                  <p className="mb-3 text-xs text-[#8888aa]">{campaign.brand.name || "Unknown Brand"}</p>
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-[#10b981]">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">Rp {campaign.cpmRate.toLocaleString()} /1K views</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#8888aa]">
                      <Users className="h-4 w-4" />
                      <span>{campaign._count.participants}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-[#8888aa]">Budget</span>
                      <span className="text-white">{formatCurrency(campaign.totalBudget)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1a1a35]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]" style={{ width: `${budgetPercent}%` }} />
                    </div>
                  </div>
                  {isJoined ? (
                    <button disabled className="w-full rounded-xl bg-[#10b981]/20 py-2.5 text-sm font-semibold text-[#10b981] flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" /> Joined
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(campaign.id)}
                      disabled={joining === campaign.id}
                      className="w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {joining === campaign.id ? (
                        <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Joining...</span>
                      ) : "Join Campaign"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
