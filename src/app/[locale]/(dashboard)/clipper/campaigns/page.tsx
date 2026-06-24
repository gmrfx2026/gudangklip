"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Search, ChevronDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PLATFORMS, CATEGORIES } from "@/lib/constants";
import { getActiveCampaigns } from "@/actions/campaign.actions";
import { getCreatorJoinedCampaignIds } from "@/actions/creator.actions";
import { joinCampaign } from "@/actions/auth.actions";
import { toast } from "sonner";

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

export default function ClipperCampaigns() {
  const t = useTranslations();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    Promise.all([getActiveCampaigns(), getCreatorJoinedCampaignIds()])
      .then(([c, ids]) => {
        setCampaigns(c as unknown as CampaignItem[]);
        setJoinedIds(ids);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (campaignId: string) => {
    setJoining(campaignId);
    try {
      await joinCampaign(campaignId);
      toast.success(t("CreatorExplore.toastJoinSuccess"));
      setJoinedIds((prev) => [...prev, campaignId]);
    } catch (err: any) {
      toast.error(err.message || t("CreatorExplore.toastJoinFailed"));
    } finally {
      setJoining(null);
    }
  };

  const togglePlatform = (p: string) => {
    setPlatformFilters((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const filtered = campaigns.filter((c) => {
    if (category && c.category !== category) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !(c.brand?.name || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const featured = filtered.length > 0 ? filtered[featuredIndex % filtered.length] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Campaign Carousel */}
      {featured && (
        <div className="rounded-2xl border border-[#2a2a50] bg-gradient-to-br from-[#111128] to-[#0d0d22] overflow-hidden">
          <div className="p-6">
            <div className="mb-3">
              <span className="rounded-full bg-[#6c63ff]/10 px-3 py-1 text-xs font-semibold text-[#6c63ff]">{t("CreatorExplore.featured")}</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff]/20 to-[#3b82f6]/20">
                <span className="text-lg font-bold text-[#6c63ff]">{featured.brand?.name?.charAt(0) || t("CreatorExplore.unknownBrand").charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{featured.title}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-[#a0a0c0]">{featured.brand?.name}</span>
                  <span className="text-xs text-[#a0a0c0]">&middot;</span>
                  <span className="text-xs text-[#a0a0c0]">
                    {t(`Category.${featured.category}` as any)}
                  </span>
                </div>
                <div className="mt-2 text-lg font-bold text-[#10b981]">
                  {formatCurrency(featured.cpmRate)} <span className="text-xs font-normal text-[#a0a0c0]">{t("CreatorExplore.perKViews")}</span>
                </div>
                <Link
                  href={`/clipper/campaigns/${featured.id}`}
                  className="mt-3 inline-flex items-center rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  {joinedIds.includes(featured.id) ? t("CreatorExplore.joined") : t("CreatorExplore.joinCampaign")}
                </Link>
              </div>
            </div>
          </div>
          {filtered.length > 1 && (
            <div className="flex items-center justify-center gap-1 p-3 border-t border-[#2a2a50]">
              <button onClick={() => setFeaturedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)} className="rounded p-1 text-[#a0a0c0] hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {filtered.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === featuredIndex ? "w-6 bg-[#6c63ff]" : "w-1.5 bg-[#2a2a50]"}`}
                />
              ))}
              <button onClick={() => setFeaturedIndex((prev) => (prev + 1) % filtered.length)} className="rounded p-1 text-[#a0a0c0] hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Explore Semua Campaign */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-white">{t("CreatorExplore.title")}</h2>
        
        {/* Search + Filters */}
        <div className="mb-4 space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a0c0]" />
              <input
              placeholder={t("CreatorExplore.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f]">
              {t("CreatorExplore.sortBy")} <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f]">
              {t("CreatorExplore.filterByCategory")} <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f]">
              {t("CreatorExplore.filterByType")} <ChevronDown className="h-3 w-3" />
            </button>
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => togglePlatform(p.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  platformFilters.includes(p.value)
                    ? "bg-[#6c63ff]/20 text-[#6c63ff] border border-[#6c63ff]/50"
                    : "border border-[#2a2a50] text-[#a0a0c0] hover:bg-[#1e1e3f]"
                }`}
              >{t(`Platform.${p.value}` as any)}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[#6b7280]">{t("CreatorExplore.empty")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const isJoined = joinedIds.includes(c.id);
              const budgetPercent = c.totalBudget > 0 ? Math.round((c.remainingBudget / c.totalBudget) * 100) : 100;
              const catLabel = t(`Category.${c.category}` as any);
              return (
                <div key={c.id} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden hover:border-[#6c63ff]/50 transition-all">
                  <div className="p-5">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e1e3f] text-sm font-bold text-[#6c63ff]">
                        {c.brand?.name?.charAt(0) || t("CreatorExplore.unknownBrand").charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{c.brand?.name || t("CreatorExplore.unknownBrand")}</span>
                          <span className="rounded bg-[#6c63ff]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#6c63ff]">{t("CreatorExplore.clipping")}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white">{c.title}</h3>
                    <div className="mb-1 text-sm font-bold text-[#10b981]">
                      {formatCurrency(c.cpmRate)} <span className="font-normal text-xs text-[#a0a0c0]">{t("CreatorExplore.perKViews")}</span>
                    </div>
                    <div className="mb-3">
                      <span className="rounded-full bg-[#1e1e3f] px-2 py-0.5 text-[10px] text-[#a0a0c0]">{catLabel}</span>
                    </div>
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-[#a0a0c0]">{t("CreatorExplore.remainingBudget")}</span>
                        <span className="text-white">{budgetPercent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1a1a35]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]" style={{ width: `${budgetPercent}%` }} />
                      </div>
                    </div>
                    {isJoined ? (
                      <Link
                        href={`/clipper/campaigns/${c.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10b981]/20 py-2.5 text-sm font-semibold text-[#10b981] transition-colors hover:bg-[#10b981]/30"
                      >
                        {t("CreatorExplore.joined")}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleJoin(c.id)}
                        disabled={joining === c.id}
                        className="w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {joining === c.id ? t("CreatorExplore.joining") : t("CreatorExplore.joinCampaign")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Discord CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-[#5865F2]/20 to-[#4752c4]/10 border border-[#5865F2]/30 p-8 text-center">
        <h2 className="mb-2 text-xl font-bold text-white">
          {t("CreatorExplore.discordTitle")}
        </h2>
        <a
          href="https://discord.gg/kontencom"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          {t("CreatorExplore.joinDiscord")}
        </a>
      </div>
    </div>
  );
}
