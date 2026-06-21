"use client";

import { useEffect, useState } from "react";
import { UserPlus, Search, Loader2, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { getAgencyMembers, getAgencyInviteLink } from "@/actions/agency.actions";
import { toast } from "sonner";

type MemberItem = {
  id: string;
  name: string;
  email: string;
  trustScore: number;
  totalViews: number;
  totalEarnings: number;
  commission: number;
};

export default function AgencyMembers() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    getAgencyMembers()
      .then((data) => setMembers(data as unknown as MemberItem[]))
      .finally(() => setLoading(false));
    getAgencyInviteLink()
      .then((data) => setInviteLink(data?.inviteLink || ""))
      .catch(() => {});
  }, []);

  const handleInvite = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        setCopied(true);
        toast.success(t("AgencyMembers.toastInviteCopied"));
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        toast.info(t("AgencyMembers.toastShareLink", { link: inviteLink }));
      });
    } else {
      toast.info(t("AgencyMembers.toastGenerating"));
    }
  };

  const filtered = search
    ? members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()))
    : members;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t("AgencyMembers.title")}</h2>
          <p className="text-[#8888aa]">{t("AgencyMembers.subtitle")}</p>
        </div>
        <button onClick={handleInvite} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          {copied ? <><Check className="h-4 w-4" /> {t("AgencyMembers.copied")}</> : <><UserPlus className="h-4 w-4" /> {t("AgencyMembers.inviteCreator")}</>}
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8888aa]" />
        <input
          placeholder={t("AgencyMembers.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-[#8888aa]">
          <p className="text-lg">{t("AgencyMembers.empty")}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#2a2a50]">
                <tr className="text-left text-xs font-medium text-[#8888aa]">
                  <th className="px-6 py-4">{t("AgencyMembers.colCreator")}</th>
                  <th className="px-6 py-4">{t("AgencyMembers.colTrustScore")}</th>
                  <th className="px-6 py-4">{t("AgencyMembers.colViews")}</th>
                  <th className="px-6 py-4">{t("AgencyMembers.colEarnings")}</th>
                  <th className="px-6 py-4">{t("AgencyMembers.colCommission")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-[#2a2a50]/50 text-sm hover:bg-[#1e1e3f]/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-xs font-bold text-white">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{m.name}</p>
                          <p className="text-xs text-[#8888aa]">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{m.trustScore}</td>
                    <td className="px-6 py-4 text-white">{formatCompactNumber(m.totalViews)}</td>
                    <td className="px-6 py-4 text-[#10b981]">{formatCurrency(m.totalEarnings)}</td>
                    <td className="px-6 py-4 text-[#10b981]">{formatCurrency(m.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
