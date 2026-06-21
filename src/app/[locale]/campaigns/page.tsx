"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Search, DollarSign, Users, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { getActiveCampaigns } from "@/actions/campaign.actions";

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

export default function PublicCampaigns() {
  const t = useTranslations();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getActiveCampaigns()
      .then((data) => setCampaigns(data as unknown as CampaignItem[]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter((c) => {
    if (category && c.category !== category) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <nav className="fixed top-0 z-50 w-full border-b border-[#2a2a50]/50 bg-[#0a0a1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-sm font-bold text-white">G</div>
            <span className="text-lg font-bold text-white">Gudang<span className="gradient-text">Klip</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#b8b8d0] hover:text-white">{t("Landing.navLogin")}</Link>
            <Link href="/register" className="rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2 text-sm font-semibold text-white hover:opacity-90">{t("Landing.navRegister")}</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white">{t("Campaigns.title")}</h1>
            <p className="text-[#b8b8d0]">{t("Campaigns.subtitle")}</p>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a0c0]" />
              <input
                placeholder={t("Campaigns.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <button onClick={() => setCategory("")} className={`rounded-xl px-4 py-2 text-xs font-medium whitespace-nowrap ${!category ? "bg-[#6c63ff] text-white" : "border border-[#2a2a50] text-[#b8b8d0]"}`}>{t("Campaigns.allCategories")}</button>
              {CATEGORIES.map((cat) => (
                <button key={cat.value} onClick={() => setCategory(cat.value)} className={`rounded-xl px-4 py-2 text-xs font-medium whitespace-nowrap ${category === cat.value ? "bg-[#6c63ff] text-white" : "border border-[#2a2a50] text-[#b8b8d0]"}`}>{cat.label}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-[#a0a0c0]">
              <p className="text-lg">{t("Campaigns.noCampaigns")}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => {
                const budgetUsed = c.totalBudget - c.remainingBudget;
                const budgetPercent = c.totalBudget > 0 ? Math.round((budgetUsed / c.totalBudget) * 100) : 0;
                return (
                  <div key={c.id} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden hover:border-[#6c63ff]/50 transition-all">
                    <div className="aspect-video bg-gradient-to-br from-[#1e1e3f] to-[#0f0f23] flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#6c63ff]/40">{c.title.charAt(0)}</span>
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#6c63ff]/10 px-2.5 py-0.5 text-xs font-medium text-[#6c63ff]">{CATEGORIES.find((x) => x.value === c.category)?.label}</span>
                      </div>
                      <h3 className="mb-1 font-semibold text-white">{c.title}</h3>
                      <p className="mb-3 text-xs text-[#a0a0c0]">{c.brand.name || t("Campaigns.unknownBrand")}</p>
                      <div className="mb-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-[#10b981]"><DollarSign className="h-4 w-4" /><span className="font-semibold">Rp {c.cpmRate.toLocaleString()} {t("Campaigns.perKViews")}</span></div>
                        <div className="flex items-center gap-1 text-[#a0a0c0]"><Users className="h-4 w-4" /><span>{c._count.participants}</span></div>
                      </div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-[#a0a0c0]">{t("Campaigns.budget")}</span><span className="text-white">{formatCurrency(c.totalBudget)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1a1a35]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]" style={{ width: `${budgetPercent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
