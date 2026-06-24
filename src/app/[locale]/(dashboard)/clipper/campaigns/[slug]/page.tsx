"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Loader2,
  Share2,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Play,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
} from "lucide-react";
import { formatCurrency, formatCompactNumber, timeAgo } from "@/lib/utils";
import { PLATFORMS, CATEGORIES } from "@/lib/constants";
import { getActiveCampaigns, getCampaignSubmissions } from "@/actions/campaign.actions";
import { getCreatorJoinedCampaignIds } from "@/actions/creator.actions";
import { joinCampaign } from "@/actions/auth.actions";
import { SubmissionModal } from "@/components/shared/submission-modal";
import { toast } from "sonner";

type CampaignDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  cpmRate: number;
  totalBudget: number;
  remainingBudget: number;
  minViewsToClaim: number;
  maxViewsPerVideo: number | null;
  status: string;
  startDate: string;
  endDate: string;
  brand: { name: string | null; image: string | null };
  _count: { participants: number; submissions: number };
};

type MySubmission = {
  id: string;
  platform: string | null;
  platformLink: string | null;
  status: string;
  views: number;
  submittedAt: string;
};

type TopEntry = {
  id: string;
  creatorName: string;
  creatorImage: string | null;
  platform: string | null;
  views: number;
  status: string;
  submittedAt: string;
  videoUrl: string | null;
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; labelKey: string }> = {
  PENDING: { icon: <Clock className="h-3.5 w-3.5" />, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", labelKey: "CreatorAnalytics.pending" },
  APPROVED: { icon: <CheckCircle className="h-3.5 w-3.5" />, color: "text-[#10b981]", bg: "bg-[#10b981]/10", labelKey: "CreatorAnalytics.approved" },
  REJECTED: { icon: <XCircle className="h-3.5 w-3.5" />, color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", labelKey: "CreatorAnalytics.rejected" },
};

export default function CampaignDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "videos">("detail");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Submission data
  const [mySubmissions, setMySubmissions] = useState<MySubmission[]>([]);
  const [top10, setTop10] = useState<TopEntry[]>([]);
  const [hasMySubmission, setHasMySubmission] = useState(false);

  const fetchSubmissions = () => {
    getCampaignSubmissions(slug).then((data) => {
      setMySubmissions(data.mySubmissions);
      setTop10(data.top10);
      setHasMySubmission(data.mySubmissions.length > 0);
    }).catch(() => {});
  };

  useEffect(() => {
    Promise.all([getActiveCampaigns(), getCreatorJoinedCampaignIds()])
      .then(([campaigns, ids]) => {
        const found = (campaigns as any[]).find((c: any) => c.id === slug);
        setCampaign(found || null);
        setJoinedIds(ids);
        if (found) fetchSubmissions();
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleJoin = async () => {
    if (!campaign) return;
    setJoining(true);
    try {
      await joinCampaign(campaign.id);
      toast.success(t("CreatorCampaignDetail.toastJoinSuccess"));
      setJoinedIds((prev) => [...prev, campaign.id]);
    } catch (err: any) {
      toast.error(err.message || t("CreatorCampaignDetail.toastJoinFailed"));
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-[#a0a0c0]">{t("CreatorCampaignDetail.campaignNotFound")}</p>
        <Link href="/clipper/campaigns" className="mt-4 inline-flex text-sm text-[#6c63ff] hover:underline">
          &larr; {t("CreatorCampaignDetail.backToCampaigns")}
        </Link>
      </div>
    );
  }

  const isJoined = joinedIds.includes(campaign.id);
  const catLabel = t(`Category.${campaign.category}` as any);
  const budgetPercent = campaign.totalBudget > 0 ? Math.round((campaign.remainingBudget / campaign.totalBudget) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/clipper/campaigns" className="text-[#a0a0c0] hover:text-white">{t("CreatorCampaignDetail.breadcrumbCampaigns")}</Link>
        <ChevronRight className="h-3 w-3 text-[#a0a0c0]" />
        <span className="text-white">{campaign.title}</span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2a2a50]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6c63ff]/10 to-[#111128]" />
        <div className="relative p-6">
          <Link href="/clipper/campaigns" className="mb-4 inline-flex items-center gap-1 text-sm text-[#a0a0c0] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> {t("CreatorCampaignDetail.back")}
          </Link>
          <div className="mt-4 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff]/20 to-[#3b82f6]/20">
                <span className="text-lg font-bold text-[#6c63ff]">{campaign.brand?.name?.charAt(0) || t("CreatorCampaignDetail.unknownBrandInitial")}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{campaign.brand?.name}</span>
                <span className="rounded bg-[#6c63ff]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#6c63ff]">{t("CreatorCampaignDetail.clip")}</span>
                <span className="rounded-full bg-[#10b981]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#10b981]">{t("CreatorCampaignDetail.active")}</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold text-white">{campaign.title}</h1>
              <div className="mt-1 text-lg font-bold text-[#10b981]">
                Rp{campaign.cpmRate.toLocaleString()} <span className="text-xs font-normal text-[#a0a0c0]">{t("CreatorCampaignDetail.perKViews")}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            {PLATFORMS.slice(0, 3).map((p) => (
              <span key={p.value} className="text-xs text-[#a0a0c0]">{t(`Platform.${p.value}` as any)}</span>
            ))}
            <span className="text-xs text-[#6b7280]">&middot;</span>
            <span className="rounded-full bg-[#1e1e3f] px-2 py-0.5 text-[10px] text-[#a0a0c0]">{catLabel}</span>
          </div>
          <div className="mt-4 flex gap-2">
            {!isJoined ? (
              <button onClick={handleJoin} disabled={joining} className="rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {joining ? t("CreatorCampaignDetail.joining") : t("CreatorCampaignDetail.joinCampaign")}
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                disabled={hasMySubmission}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                  hasMySubmission
                    ? "bg-[#10b981]/20 text-[#10b981] cursor-not-allowed"
                    : "bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] text-white hover:opacity-90"
                }`}
              >
                {hasMySubmission ? t("CreatorCampaignDetail.alreadySubmitted") : t("CreatorCampaignDetail.submitVideo")}
              </button>
            )}
            <button className="flex items-center gap-2 rounded-xl border border-[#2a2a50] px-4 py-2.5 text-sm text-[#a0a0c0] hover:bg-[#1e1e3f]">
              <Share2 className="h-4 w-4" /> {t("CreatorCampaignDetail.share")}
            </button>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {campaign && (
        <SubmissionModal
          open={showModal}
          onOpenChange={setShowModal}
          campaignId={campaign.id}
          campaignTitle={campaign.title}
          endDate={campaign.endDate}
          onSuccess={fetchSubmissions}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#2a2a50] bg-[#0d0d22] p-1">
        <button onClick={() => setActiveTab("detail")} className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === "detail" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"}`}>{t("CreatorCampaignDetail.tabDetail")}</button>
        <button onClick={() => setActiveTab("videos")} className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === "videos" ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"}`}>{t("CreatorCampaignDetail.tabVideos")}</button>
      </div>

      {/* Tab Content */}
      {activeTab === "detail" ? (
        <div className="space-y-6">
          {/* About */}
          <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
            <h2 className="mb-3 text-lg font-semibold text-white">{t("CreatorCampaignDetail.aboutTitle")}</h2>
            <p className={`text-sm text-[#a0a0c0] ${!showFullDesc && "line-clamp-3"}`}>
              {campaign.description || t("CreatorCampaignDetail.aboutDefault")}
            </p>
            {(campaign.description?.length ?? 0) > 150 && (
              <button onClick={() => setShowFullDesc(!showFullDesc)} className="mt-2 text-sm text-[#6c63ff] hover:underline">
                {showFullDesc ? t("CreatorCampaignDetail.showLess") : t("CreatorCampaignDetail.showMore")}
              </button>
            )}
          </div>

          {/* Brief & Materi Links */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href={`/clipper/campaigns/${slug}/brief`} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5 hover:border-[#6c63ff]/50 transition-all">
              <h3 className="mb-1 text-base font-semibold text-white">{t("CreatorCampaignDetail.briefTitle")}</h3>
              <p className="text-xs text-[#a0a0c0]">{t("CreatorCampaignDetail.briefDesc")}</p>
            </Link>
            <Link href={`/clipper/campaigns/${slug}/materi`} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5 hover:border-[#6c63ff]/50 transition-all">
              <h3 className="mb-1 text-base font-semibold text-white">{t("CreatorCampaignDetail.materiTitle")}</h3>
              <p className="text-xs text-[#a0a0c0]">{t("CreatorCampaignDetail.materiDesc")}</p>
            </Link>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="text-center">
                <div className="mb-1 text-sm text-[#a0a0c0]">{t("CreatorCampaignDetail.remainingBudget")}</div>
                <div className="text-xl font-bold text-white">{budgetPercent}%</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-sm text-[#a0a0c0]">{t("CreatorCampaignDetail.minViewClaim")}</div>
                <div className="text-xl font-bold text-white">{formatCompactNumber(campaign.minViewsToClaim || 0)} {t("CreatorCampaignDetail.noViewsSuffix")}</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-sm text-[#a0a0c0]">{t("CreatorCampaignDetail.maxViewVideo")}</div>
                <div className="text-xl font-bold text-white">{campaign.maxViewsPerVideo ? formatCompactNumber(campaign.maxViewsPerVideo) : "∞"}</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-sm text-[#a0a0c0]">{t("CreatorCampaignDetail.cpmRate")}</div>
                <div className="text-xl font-bold text-[#10b981]">Rp{campaign.cpmRate.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Top 10 Clip */}
          <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{t("CreatorCampaignDetail.top10Title")}</h3>
              <button onClick={fetchSubmissions} className="flex items-center gap-2 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f] transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> {t("CreatorCampaignDetail.refreshViews")}
              </button>
            </div>
            {top10.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#6b7280]">{t("CreatorCampaignDetail.emptyTop10")}</p>
            ) : (
              <div className="space-y-2">
                {top10.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-4 rounded-xl border border-[#1e1e3f] bg-[#0d0d22]/50 p-4">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      i === 0 ? "bg-[#f59e0b]/20 text-[#f59e0b]" :
                      i === 1 ? "bg-[#a0a0c0]/20 text-[#a0a0c0]" :
                      i === 2 ? "bg-[#cd7f32]/20 text-[#cd7f32]" :
                      "bg-[#1e1e3f] text-[#a0a0c0]"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{entry.creatorName}</p>
                      <p className="text-xs text-[#a0a0c0]">
                        {entry.platform ? t(`Platform.${entry.platform}` as any) : t("CreatorCampaignDetail.unknownPlatform")} &middot; {formatCompactNumber(entry.views)} {t("CreatorCampaignDetail.noViewsSuffix")}
                      </p>
                    </div>
                    {entry.videoUrl && (
                      <a href={entry.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg bg-[#6c63ff]/10 px-3 py-1.5 text-xs font-medium text-[#6c63ff] hover:bg-[#6c63ff]/20 transition-colors">
                        <Play className="h-3 w-3" /> {t("CreatorCampaignDetail.watch")}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          {mySubmissions.length === 0 ? (
            <div className="py-12 text-center">
              <Play className="mx-auto mb-3 h-10 w-10 text-[#6b7280]" />
               <p className="text-sm text-[#a0a0c0]">{t("CreatorCampaignDetail.emptyVideo")}</p>
               {isJoined && !hasMySubmission && (
                 <button onClick={() => setShowModal(true)} className="mt-3 inline-flex rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                   {t("CreatorCampaignDetail.submitNow")}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {mySubmissions.map((sub) => {
                const config = statusConfig[sub.status] || statusConfig.PENDING;
                return (
                  <div key={sub.id} className="flex flex-col gap-4 rounded-xl border border-[#1e1e3f] bg-[#0d0d22]/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e1e3f] to-[#0f0f23] text-sm font-bold text-[#a0a0c0]">
                        {sub.platform ? t(`Platform.${sub.platform}` as any).charAt(0) : t("CreatorCampaignDetail.unknownBrandInitial")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{campaign.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-[#a0a0c0]">
                          <span>{sub.platform ? t(`Platform.${sub.platform}` as any) : t("CreatorCampaignDetail.unknownPlatform")}</span>
                          <span>{timeAgo(sub.submittedAt)}</span>
                          {sub.platformLink && (
                            <a href={sub.platformLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#6c63ff] hover:underline">
                              <ExternalLink className="h-3 w-3" /> {t("CreatorCampaignDetail.submissionWatch")}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-base font-bold text-white">{formatCompactNumber(sub.views)}</div>
                        <div className="text-xs text-[#a0a0c0]">{t("CreatorCampaignDetail.submissionViews")}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold text-[#10b981]">Rp {(sub.views * (campaign.cpmRate / 1000)).toLocaleString()}</div>
                        <div className="text-xs text-[#a0a0c0]">{t("CreatorCampaignDetail.submissionEstimated")}</div>
                      </div>
                      <div className={`flex items-center gap-1 rounded-full ${config.bg} px-2.5 py-1`}>
                        {config.icon}
                        <span className={`text-xs font-medium ${config.color}`}>{t(config.labelKey as any)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
