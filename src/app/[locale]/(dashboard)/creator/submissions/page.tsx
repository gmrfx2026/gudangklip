"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, Link, CheckCircle, XCircle, Clock, ExternalLink, Loader2 } from "lucide-react";
import { PLATFORMS } from "@/lib/constants";
import { formatCompactNumber } from "@/lib/utils";
import { toast } from "sonner";
import { submitVideo, getCreatorSubmissions } from "@/actions/submission.actions";
import { getCreatorCampaigns } from "@/actions/creator.actions";

type SubmissionItem = {
  id: string;
  campaign: { title: string; cpmRate: number };
  platform: string | null;
  platformLink: string | null;
  status: string;
  viewLogs: { views: number }[];
  submittedAt: string;
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  PENDING: { icon: <Clock className="h-4 w-4" />, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", label: "Pending" },
  APPROVED: { icon: <CheckCircle className="h-4 w-4" />, color: "text-[#10b981]", bg: "bg-[#10b981]/10", label: "Approved" },
  REJECTED: { icon: <XCircle className="h-4 w-4" />, color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", label: "Rejected" },
};

export default function SubmissionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [joinedCampaigns, setJoinedCampaigns] = useState<{ id: string; title: string; cpmRate: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslations();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getCreatorSubmissions(),
      getCreatorCampaigns(),
    ])
      .then(([subs, camps]) => {
        setSubmissions(subs as unknown as SubmissionItem[]);
        setJoinedCampaigns((camps as any[]).map((c: any) => ({ id: c.id, title: c.title, cpmRate: c.cpmRate })));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const campaignId = formData.get("campaignId") as string;
    const platform = formData.get("platform") as string;
    const platformLink = formData.get("platformLink") as string;

    if (!campaignId) { toast.error(t("CreatorSubmissions.selectCampaignFirst")); return; }

    setSubmitting(true);
    try {
      await submitVideo({ campaignId, platform: platform || undefined, platformLink: platformLink || undefined });
      toast.success(t("CreatorSubmissions.toastSubmitSuccess"));
      setShowForm(false);
      form.reset();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || t("CreatorSubmissions.toastSubmitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t("CreatorSubmissions.title")}</h2>
          <p className="text-[#8888aa]">{t("CreatorSubmissions.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Upload className="mr-2 inline h-4 w-4" />
          {t("CreatorSubmissions.submitVideo")}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("CreatorSubmissions.submitNew")}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("CreatorSubmissions.campaign")}</label>
              <select name="campaignId" className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none">
                <option value="">{t("CreatorSubmissions.selectCampaign")}</option>
                {joinedCampaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.title} (Rp {c.cpmRate.toLocaleString()}/1K)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("CreatorSubmissions.platform")}</label>
              <select name="platform" className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none">
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("CreatorSubmissions.videoLink")}</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8888aa]" />
                <input
                  name="platformLink"
                  placeholder={t("CreatorSubmissions.videoLinkPlaceholder")}
                  className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none"
                />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? t("CreatorSubmissions.submitting") : t("CreatorSubmissions.submitNow")}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-20 text-center text-[#8888aa]">
          <p className="text-lg">{t("CreatorSubmissions.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const config = statusConfig[sub.status] || statusConfig.PENDING;
            const totalViews = sub.viewLogs.reduce((sum, v) => sum + v.views, 0);
            const estimatedPayout = Math.round(totalViews * (sub.campaign?.cpmRate || 0) / 1000);
            return (
              <div key={sub.id} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e1e3f] to-[#0f0f23] text-xl">
                      {sub.platform === "TIKTOK" ? "\uD83C\uDFB5" : sub.platform === "INSTAGRAM" ? "\uD83D\uDCF7" : "\u25B6\uFE0F"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{sub.campaign?.title || t("CreatorSubmissions.unknownCampaign")}</h4>
                      <div className="mt-1 flex items-center gap-3 text-sm text-[#8888aa]">
                        <span>{PLATFORMS.find((p) => p.value === sub.platform)?.label || sub.platform || "N/A"}</span>
                        {sub.platformLink && (
                          <a href={sub.platformLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#6c63ff] hover:underline">
                            <ExternalLink className="h-3 w-3" /> {t("CreatorSubmissions.viewVideo")}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{formatCompactNumber(totalViews)}</div>
                      <div className="text-xs text-[#8888aa]">{t("CreatorSubmissions.views")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#10b981]">Rp {estimatedPayout.toLocaleString()}</div>
                      <div className="text-xs text-[#8888aa]">{t("CreatorSubmissions.estimated")}</div>
                    </div>
                    <div className={`flex items-center gap-1.5 rounded-full ${config.bg} px-3 py-1.5`}>
                      {config.icon}
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
