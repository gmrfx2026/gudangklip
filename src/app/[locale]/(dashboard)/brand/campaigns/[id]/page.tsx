"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Users,
  DollarSign,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  FileText,
  Download,
} from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { getBrandCampaignById } from "@/actions/campaign.actions";
import { reviewSubmission } from "@/actions/submission.actions";
import { toast } from "sonner";

const PLATFORM_LABELS: Record<string, string> = {
  TIKTOK: "TikTok",
  INSTAGRAM: "Instagram",
  YOUTUBE: "YouTube",
};

type SubmissionView = {
  id: string;
  creator: { id: string; name: string | null; image: string | null };
  views: number;
  status: string;
  platform: string | null;
  videoUrl: string | null;
  platformLink: string | null;
  submittedAt: string;
  estimatedPayout: number;
};

type CampaignDetail = {
  id: string;
  title: string;
  description: string | null;
  brief: string | null;
  category: string;
  status: string;
  cpmRate: number;
  totalBudget: number;
  remainingBudget: number;
  totalViews: number;
  brand: { name: string; image: string | null; companyName: string | null };
  _count: { participants: number; submissions: number };
  submissions: SubmissionView[];
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  PENDING: { icon: <Clock className="h-4 w-4" />, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  APPROVED: { icon: <CheckCircle className="h-4 w-4" />, color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  REJECTED: { icon: <XCircle className="h-4 w-4" />, color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
};

const campaignStatusConfig: Record<string, { color: string; bg: string }> = {
  DRAFT: { color: "text-[#a0a0c0]", bg: "bg-[#8888aa]/10" },
  ACTIVE: { color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  PAUSED: { color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  ENDED: { color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
};

export default function CampaignDetail() {
  const t = useTranslations();
  const { id } = useParams();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"detail" | "submission" | "analytic">("detail");

  const fetchCampaign = useCallback(() => {
    if (!id) return;
    setLoading(true);
    getBrandCampaignById(id as string)
      .then((data) => setCampaign(data as unknown as CampaignDetail))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchCampaign(); }, [fetchCampaign]);

  const handleReview = async (submissionId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewSubmission(submissionId, status);
      toast.success(status === "APPROVED" ? t("BrandCampaignDetail.toastApproved") : t("BrandCampaignDetail.toastRejected"));
      fetchCampaign();
    } catch (err: any) {
      toast.error(err.message || t("BrandCampaignDetail.toastReviewFailed"));
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
    return <p className="py-20 text-center text-[#a0a0c0]">{t("BrandCampaignDetail.notFound")}</p>;
  }

  const campaignStatus = campaignStatusConfig[campaign.status];
  const approvedSubs = campaign.submissions.filter((s) => s.status === "APPROVED");
  const pendingSubs = campaign.submissions.filter((s) => s.status === "PENDING");
  const rejectedSubs = campaign.submissions.filter((s) => s.status === "REJECTED");
  const top10 = [...approvedSubs].sort((a, b) => b.views - a.views).slice(0, 10);

  return (
    <div className="space-y-6">
      <Link href="/brand/campaigns" className="flex items-center gap-2 text-sm text-[#a0a0c0] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {t("BrandCampaignDetail.backToCampaigns")}
      </Link>

      {/* Hero Banner */}
      <div className="rounded-2xl border border-[#2a2a50] bg-gradient-to-br from-[#111128] to-[#6c63ff]/5 p-6">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-[#6c63ff]/10 px-2.5 py-0.5 text-xs font-medium text-[#6c63ff]">
            {CATEGORIES.find((cat) => cat.value === campaign.category)?.label || campaign.category}
          </span>
          <span className={`rounded-full ${campaignStatus.bg} px-2.5 py-0.5 text-xs font-medium ${campaignStatus.color}`}>
            {campaign.status}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white">{campaign.title}</h2>
        <div className="mt-2 flex items-center gap-4 text-sm text-[#a0a0c0]">
          <span>CPM: Rp {campaign.cpmRate.toLocaleString()}</span>
          <span>{t("BrandCampaignDetail.creators")}: {campaign._count.participants}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden">
        <div className="flex border-b border-[#2a2a50]">
          {(["detail", "submission", "analytic"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-[#6c63ff] text-[#6c63ff] bg-[#6c63ff]/5"
                  : "text-[#a0a0c0] hover:text-white"
              }`}
            >
              {tab === "detail" ? t("BrandCampaignDetail.detailTab") : tab === "submission" ? t("BrandCampaignDetail.submissionTab") : t("BrandCampaignDetail.analyticTab")}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "detail" ? (
            <div className="space-y-6">
              {/* About Campaign */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">{t("BrandCampaignDetail.aboutCampaign")}</h3>
                <p className="text-sm text-[#a0a0c0] leading-relaxed">{campaign.description || "-"}</p>
              </div>

              {/* Brief & Material */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-[#0d0d22] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-[#6c63ff]" />
                    <span className="text-sm font-medium text-white">{t("BrandCampaignDetail.brief")}</span>
                  </div>
                  {campaign.brief ? (
                    <div>
                      <p className="text-sm text-[#a0a0c0] mb-2 line-clamp-3">{campaign.brief}</p>
                      <button className="flex items-center gap-1 text-xs text-[#6c63ff] hover:underline">
                        <Download className="h-3 w-3" /> {t("BrandCampaignDetail.download")}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-[#6b7280]">{t("BrandCampaignDetail.noBrief")}</p>
                  )}
                </div>
                <div className="rounded-xl bg-[#0d0d22] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="h-4 w-4 text-[#6c63ff]" />
                    <span className="text-sm font-medium text-white">{t("BrandCampaignDetail.material")}</span>
                  </div>
                  <p className="text-sm text-[#6b7280]">{t("BrandCampaignDetail.noMaterial")}</p>
                </div>
              </div>

              {/* Budget Info */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">{t("BrandCampaignDetail.budgetInfo")}</h3>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-[#0d0d22] p-4">
                    <div className="flex items-center gap-2 text-sm text-[#a0a0c0]"><Users className="h-4 w-4" /> {t("BrandCampaignDetail.creators")}</div>
                    <div className="text-xl font-bold text-white">{campaign._count.participants}</div>
                  </div>
                  <div className="rounded-xl bg-[#0d0d22] p-4">
                    <div className="flex items-center gap-2 text-sm text-[#a0a0c0]"><BarChart3 className="h-4 w-4" /> {t("BrandCampaignDetail.totalViews")}</div>
                    <div className="text-xl font-bold text-white">{formatCompactNumber(campaign.totalViews)}</div>
                  </div>
                  <div className="rounded-xl bg-[#0d0d22] p-4">
                    <div className="flex items-center gap-2 text-sm text-[#a0a0c0]"><DollarSign className="h-4 w-4" /> {t("BrandCampaignDetail.remainingBudget")}</div>
                    <div className="text-xl font-bold text-white">{formatCurrency(campaign.remainingBudget)}</div>
                  </div>
                  <div className="rounded-xl bg-[#0d0d22] p-4">
                    <div className="flex items-center gap-2 text-sm text-[#a0a0c0]">{t("BrandCampaignDetail.cpm")}</div>
                    <div className="text-xl font-bold text-white">Rp {campaign.cpmRate.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Top 10 Clip */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">{t("BrandCampaignDetail.top10Clip")}</h3>
                {top10.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("BrandCampaignDetail.emptySubmissions")}</p>
                ) : (
                  <div className="space-y-2">
                    {top10.map((sub, i) => (
                      <div key={sub.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6c63ff]/10 text-xs font-bold text-[#6c63ff]">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">{sub.creator.name || "Unknown"}</p>
                            <p className="text-xs text-[#a0a0c0]">
                              {sub.platform ? PLATFORM_LABELS[sub.platform] : "-"} &middot; {formatCompactNumber(sub.views)} views
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-[#10b981]">
                          Rp {sub.estimatedPayout.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "submission" ? (
            <div>
              <div className="mb-4 flex gap-2">
                <span className="rounded-lg bg-[#10b981]/10 px-3 py-1 text-xs font-medium text-[#10b981]">
                  {t("BrandCampaignDetail.approved")}: {approvedSubs.length}
                </span>
                <span className="rounded-lg bg-[#f59e0b]/10 px-3 py-1 text-xs font-medium text-[#f59e0b]">
                  {t("BrandCampaignDetail.pending")}: {pendingSubs.length}
                </span>
                <span className="rounded-lg bg-[#ef4444]/10 px-3 py-1 text-xs font-medium text-[#ef4444]">
                  {t("BrandCampaignDetail.rejected")}: {rejectedSubs.length}
                </span>
              </div>
              {campaign.submissions.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("BrandCampaignDetail.emptySubmissions")}</p>
              ) : (
                <div className="space-y-3">
                  {campaign.submissions.map((sub) => {
                    const config = statusConfig[sub.status];
                    return (
                      <div key={sub.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                        <div className="flex items-center gap-3">
                          {sub.creator.image ? (
                            <img src={sub.creator.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e1e3f] text-xs text-[#a0a0c0]">
                              {(sub.creator.name || "?").charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{sub.creator.name || sub.creator.id}</p>
                            <p className="text-xs text-[#a0a0c0]">
                              {sub.platform ? PLATFORM_LABELS[sub.platform] : "N/A"} &middot; {formatCompactNumber(sub.views)} views &middot; Rp {sub.estimatedPayout.toLocaleString()} {t("BrandCampaignDetail.estimated")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {sub.platformLink && (
                            <a href={sub.platformLink} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-[#6c63ff] hover:bg-[#6c63ff]/10">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <span className={`flex items-center gap-1 rounded-full ${config.bg} px-3 py-1 text-xs font-medium ${config.color}`}>
                            {config.icon} {sub.status === "APPROVED" ? t("BrandCampaignDetail.approved") : sub.status === "REJECTED" ? t("BrandCampaignDetail.rejected") : t("BrandCampaignDetail.pending")}
                          </span>
                          {sub.status === "PENDING" && (
                            <div className="flex gap-1">
                              <button onClick={() => handleReview(sub.id, "APPROVED")} className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#10b981] hover:bg-[#10b981]/10">{t("BrandCampaignDetail.approve")}</button>
                              <button onClick={() => handleReview(sub.id, "REJECTED")} className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#ef4444] hover:bg-[#ef4444]/10">{t("BrandCampaignDetail.reject")}</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Analytic Tab */
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-[#0d0d22] p-4 text-center">
                  <div className="text-sm text-[#a0a0c0]">{t("BrandCampaignDetail.totalViews")}</div>
                  <div className="mt-1 text-2xl font-bold text-white">{formatCompactNumber(campaign.totalViews)}</div>
                </div>
                <div className="rounded-xl bg-[#0d0d22] p-4 text-center">
                  <div className="text-sm text-[#a0a0c0]">{t("BrandCampaignDetail.submissions")}</div>
                  <div className="mt-1 text-2xl font-bold text-white">{campaign._count.submissions}</div>
                </div>
                <div className="rounded-xl bg-[#0d0d22] p-4 text-center">
                  <div className="text-sm text-[#a0a0c0]">{t("BrandCampaignDetail.approved")}</div>
                  <div className="mt-1 text-2xl font-bold text-[#10b981]">{approvedSubs.length}</div>
                </div>
                <div className="rounded-xl bg-[#0d0d22] p-4 text-center">
                  <div className="text-sm text-[#a0a0c0]">CPM {t("BrandCampaignDetail.cpm")}</div>
                  <div className="mt-1 text-2xl font-bold text-[#6c63ff]">Rp {campaign.cpmRate.toLocaleString()}</div>
                </div>
              </div>
              <div className="text-center text-sm text-[#a0a0c0]">
                {t("BrandCampaignDetail.remainingBudget")}: {formatCurrency(campaign.remainingBudget)} / {formatCurrency(campaign.totalBudget)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
