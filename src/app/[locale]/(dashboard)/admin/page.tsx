"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Users, Megaphone, BarChart3, Shield, Loader2 } from "lucide-react";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { getAdminStats, approveCampaign, rejectCampaign } from "@/actions/admin.actions";
import { toast } from "sonner";

type AdminStats = {
  totalUsers: number;
  activeCampaigns: number;
  pendingSubmissions: number;
  totalPayout: number;
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[];
  pendingCampaigns: { id: string; title: string; brand: { name: string | null }; totalBudget: number; createdAt: string }[];
};

export default function AdminOverview() {
  const t = useTranslations();
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    getAdminStats()
      .then((d) => setData(d as unknown as AdminStats))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (campaignId: string) => {
    try {
      await approveCampaign(campaignId);
      toast.success(t("Admin.campaignApproved"));
      fetchData();
    } catch (err: any) {
      toast.error(err.message || t("Admin.approveFailed"));
    }
  };

  const handleReject = async (campaignId: string) => {
    try {
      await rejectCampaign(campaignId, "Ditolak oleh admin");
      toast.success(t("Admin.campaignRejected"));
      fetchData();
    } catch (err: any) {
      toast.error(err.message || t("Admin.rejectFailed"));
    }
  };

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
        <h2 className="text-2xl font-bold text-white">{t("Admin.title")}</h2>
        <p className="text-[#8888aa]">{t("Admin.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("Admin.totalUsers"), value: data.totalUsers.toLocaleString(), icon: <Users className="h-5 w-5" /> },
          { label: t("Admin.activeCampaigns"), value: String(data.activeCampaigns), icon: <Megaphone className="h-5 w-5" /> },
          { label: t("Admin.totalPayout"), value: formatCurrency(data.totalPayout), icon: <BarChart3 className="h-5 w-5" /> },
          { label: t("Admin.pendingReviews"), value: String(data.pendingSubmissions), icon: <Shield className="h-5 w-5" /> },
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("Admin.recentUsers")}</h3>
          {data.recentUsers.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#8888aa]">{t("Admin.noUsers")}</p>
          ) : (
            <div className="space-y-3">
              {data.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                  <div>
                    <p className="font-medium text-white">{u.name}</p>
                    <p className="text-xs text-[#8888aa]">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#6c63ff]/10 px-2.5 py-0.5 text-xs font-medium text-[#6c63ff]">{u.role}</span>
                    <span className="text-xs text-[#8888aa]">{timeAgo(new Date(u.createdAt))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("Admin.pendingApprovals")}</h3>
          {data.pendingCampaigns.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#8888aa]">{t("Admin.noPendingCampaigns")}</p>
          ) : (
            <div className="space-y-3">
              {data.pendingCampaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                  <div>
                    <p className="font-medium text-white">{c.title}</p>
                    <p className="text-xs text-[#8888aa]">{c.brand.name || "Unknown"} &middot; {formatCurrency(c.totalBudget)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(c.id)} className="rounded-lg bg-[#10b981]/10 px-3 py-1.5 text-xs font-medium text-[#10b981] hover:bg-[#10b981]/20">{t("Admin.approve")}</button>
                    <button onClick={() => handleReject(c.id)} className="rounded-lg bg-[#ef4444]/10 px-3 py-1.5 text-xs font-medium text-[#ef4444] hover:bg-[#ef4444]/20">{t("Admin.reject")}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}