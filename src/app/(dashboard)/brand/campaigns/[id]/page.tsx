"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, DollarSign, BarChart3, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { getBrandCampaignById } from "@/actions/campaign.actions";
import { reviewSubmission } from "@/actions/submission.actions";
import { toast } from "sonner";

type SubmissionView = {
  id: string;
  creator: { id: string; name: string | null; image: string | null };
  views: number;
  status: string;
  platform: string | null;
};

type CampaignDetail = {
  id: string;
  title: string;
  category: string;
  status: string;
  cpmRate: number;
  totalBudget: number;
  remainingBudget: number;
  totalViews: number;
  _count: { participants: number; submissions: number };
  submissions: SubmissionView[];
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  PENDING: { icon: <Clock className="h-4 w-4" />, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  APPROVED: { icon: <CheckCircle className="h-4 w-4" />, color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  REJECTED: { icon: <XCircle className="h-4 w-4" />, color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
};

const campaignStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  DRAFT: { color: "text-[#8888aa]", bg: "bg-[#8888aa]/10", label: "Draft" },
  ACTIVE: { color: "text-[#10b981]", bg: "bg-[#10b981]/10", label: "Active" },
  PAUSED: { color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", label: "Paused" },
  ENDED: { color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", label: "Ended" },
};

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
      toast.success(status === "APPROVED" ? "Submission disetujui" : "Submission ditolak");
      fetchCampaign();
    } catch (err: any) {
      toast.error(err.message || "Gagal mereview submission");
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
    return <p className="py-20 text-center text-[#8888aa]">Campaign tidak ditemukan.</p>;
  }

  const campaignStatus = campaignStatusConfig[campaign.status];

  return (
    <div className="space-y-6">
      <Link href="/brand/campaigns" className="flex items-center gap-2 text-sm text-[#8888aa] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Campaigns
      </Link>

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-[#6c63ff]/10 px-2.5 py-0.5 text-xs font-medium text-[#6c63ff]">
            {CATEGORIES.find((cat) => cat.value === campaign.category)?.label}
          </span>
          <span className={`rounded-full ${campaignStatus.bg} px-2.5 py-0.5 text-xs font-medium ${campaignStatus.color}`}>
            {campaignStatus.label}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white">{campaign.title}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#0d0d22] p-4">
            <div className="flex items-center gap-2 text-sm text-[#8888aa]"><Users className="h-4 w-4" /> Creators</div>
            <div className="text-xl font-bold text-white">{campaign._count.participants}</div>
          </div>
          <div className="rounded-xl bg-[#0d0d22] p-4">
            <div className="flex items-center gap-2 text-sm text-[#8888aa]"><BarChart3 className="h-4 w-4" /> Total Views</div>
            <div className="text-xl font-bold text-white">{formatCompactNumber(campaign.totalViews)}</div>
          </div>
          <div className="rounded-xl bg-[#0d0d22] p-4">
            <div className="flex items-center gap-2 text-sm text-[#8888aa]"><DollarSign className="h-4 w-4" /> Sisa Budget</div>
            <div className="text-xl font-bold text-white">{formatCurrency(campaign.remainingBudget)}</div>
          </div>
          <div className="rounded-xl bg-[#0d0d22] p-4">
            <div className="flex items-center gap-2 text-sm text-[#8888aa]">CPM</div>
            <div className="text-xl font-bold text-white">Rp {campaign.cpmRate.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Submissions ({campaign.submissions.length})</h3>
        {campaign.submissions.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8888aa]">Belum ada submission.</p>
        ) : (
          <div className="space-y-3">
            {campaign.submissions.map((sub) => {
              const config = statusConfig[sub.status];
              const estimatedPayout = Math.round(sub.views * campaign.cpmRate / 1000);
              return (
                <div key={sub.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                  <div>
                    <p className="font-medium text-white">{sub.creator.name || sub.creator.id}</p>
                    <p className="text-xs text-[#8888aa]">
                      {sub.platform || "N/A"} &middot; {formatCompactNumber(sub.views)} views &middot; Rp {estimatedPayout.toLocaleString()} estimasi
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 rounded-full ${config.bg} px-3 py-1 text-xs font-medium ${config.color}`}>
                      {config.icon} {sub.status === "APPROVED" ? "Approved" : sub.status === "REJECTED" ? "Rejected" : "Pending"}
                    </span>
                    {sub.status === "PENDING" && (
                      <div className="flex gap-1">
                        <button onClick={() => handleReview(sub.id, "APPROVED")} className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#10b981] hover:bg-[#10b981]/10">Approve</button>
                        <button onClick={() => handleReview(sub.id, "REJECTED")} className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#ef4444] hover:bg-[#ef4444]/10">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
