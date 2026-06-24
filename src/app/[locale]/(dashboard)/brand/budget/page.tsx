"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Wallet, TrendingUp, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getBrandBudget } from "@/actions/budget.actions";
import { createTopUp } from "@/actions/transaction.actions";
import { toast } from "sonner";

type CampBudget = {
  id: string;
  title: string;
  status: string;
  totalBudget: number;
  remainingBudget: number;
};

type TransactionItem = {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
};

type BudgetData = {
  walletBalance: number;
  campaigns: CampBudget[];
  transactions: TransactionItem[];
};

export default function BrandBudget() {
  const t = useTranslations();
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyTab, setHistoryTab] = useState<"completed" | "onProcess">("completed");
  const [toppingUp, setToppingUp] = useState(false);

  const fetchData = () => {
    getBrandBudget()
      .then((d) => setData(d as unknown as BudgetData))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleTopUp = async () => {
    const amountStr = window.prompt(t("BrandBudget.topUpPrompt"));
    if (!amountStr) return;
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount < 10000) {
      toast.error(t("BrandBudget.topUpMinError"));
      return;
    }
    setToppingUp(true);
    try {
      const result = await createTopUp(amount);
      if (result?.snapToken) {
        (window as any).snap?.pay?.(result.snapToken, {
          onSuccess: () => { toast.success(t("BrandBudget.toastTopUpSuccess")); fetchData(); },
          onPending: () => { toast.success(t("BrandBudget.toastTopUpSuccess")); fetchData(); },
          onError: () => toast.error(t("BrandBudget.toastFailed")),
          onClose: () => {},
        });
      }
    } catch (err: any) {
      toast.error(err.message || t("BrandBudget.toastFailed"));
    } finally {
      setToppingUp(false);
    }
  };

  const handleRefund = () => {
    toast.success(t("BrandBudget.toastRefundSuccess"));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
      </div>
    );
  }

  if (!data) return null;

  const allocatedToCampaigns = data.campaigns.reduce((sum, c) => sum + (c.totalBudget - c.remainingBudget), 0);
  const completedTx = data.transactions.filter((tx) => tx.status === "COMPLETED" || tx.status === "SUCCESS");
  const onProcessTx = data.transactions.filter((tx) => tx.status !== "COMPLETED" && tx.status !== "SUCCESS");
  const activeTx = historyTab === "completed" ? completedTx : onProcessTx;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t("BrandBudget.title")}</h2>
        <p className="text-[#a0a0c0]">{t("BrandBudget.subtitle")}</p>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl border border-[#2a2a50] bg-gradient-to-br from-[#111128] to-[#6c63ff]/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#a0a0c0]">
              <Wallet className="h-4 w-4" /> {t("BrandBudget.balanceAvailable")}
            </div>
            <div className="mt-1 text-3xl font-bold text-white">{formatCurrency(data.walletBalance)}</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleTopUp}
              disabled={toppingUp}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <ArrowUp className="h-4 w-4" />
              {toppingUp ? t("Common.loading") : t("BrandBudget.requestTopUp")}
            </button>
            <button
              onClick={handleRefund}
              className="flex items-center gap-2 rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-2.5 text-sm font-medium text-[#e8e8f0] hover:bg-[#1e1e3f] transition-colors"
            >
              <ArrowDown className="h-4 w-4" />
              {t("BrandBudget.requestRefund")}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[#0d0d22]/50 p-4">
            <div className="flex items-center gap-2 text-sm text-[#a0a0c0]">
              <TrendingUp className="h-4 w-4" /> {t("BrandBudget.allocatedToCampaign")}
            </div>
            <div className="mt-1 text-2xl font-bold text-[#6c63ff]">{formatCurrency(allocatedToCampaigns)}</div>
          </div>
          <div className="rounded-xl bg-[#0d0d22]/50 p-4">
            <div className="flex items-center gap-2 text-sm text-[#a0a0c0]">
              <Wallet className="h-4 w-4" /> {t("BrandBudget.totalBrandBalance")}
            </div>
            <div className="mt-1 text-2xl font-bold text-white">{formatCurrency(data.walletBalance + allocatedToCampaigns)}</div>
          </div>
        </div>
      </div>

      {/* Campaign Budget List */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">{t("BrandBudget.campaignBudgets")}</h3>
        {data.campaigns.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("Common.noData")}</p>
        ) : (
          <div className="space-y-3">
            {data.campaigns.map((camp) => (
              <div key={camp.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                <div className="flex-1">
                  <p className="font-medium text-white">{camp.title}</p>
                  <div className="mt-1 flex items-center gap-4 text-xs text-[#a0a0c0]">
                    <span>{formatCurrency(camp.totalBudget)} {t("BrandCampaignDetail.totalBudget")}</span>
                    <span className="text-[#10b981]">{formatCurrency(camp.remainingBudget)} {t("BrandCampaignDetail.remainingBudget")}</span>
                  </div>
                  {/* Budget bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-[#1e1e3f]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6]"
                      style={{ width: `${camp.totalBudget > 0 ? Math.round(((camp.totalBudget - camp.remainingBudget) / camp.totalBudget) * 100) : 0}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => toast.success(t("BrandBudget.budgetAdded"))}
                  className="ml-4 rounded-lg bg-[#6c63ff]/10 px-3 py-1.5 text-xs font-medium text-[#6c63ff] hover:bg-[#6c63ff]/20 transition-colors"
                >
                  {t("BrandBudget.addBudget")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">{t("BrandBudget.history")}</h3>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setHistoryTab("completed")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              historyTab === "completed"
                ? "bg-[#6c63ff] text-white"
                : "bg-[#0d0d22] text-[#a0a0c0] hover:text-white"
            }`}
          >
            {t("BrandBudget.historyCompleted")}
          </button>
          <button
            onClick={() => setHistoryTab("onProcess")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              historyTab === "onProcess"
                ? "bg-[#6c63ff] text-white"
                : "bg-[#0d0d22] text-[#a0a0c0] hover:text-white"
            }`}
          >
            {t("BrandBudget.historyOnProcess")}
          </button>
        </div>
        {activeTx.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("BrandBudget.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2a2a50] text-[#a0a0c0]">
                  <th className="pb-3 pr-4 font-medium">{t("BrandBudget.colDate")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("BrandBudget.colAmount")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("BrandBudget.colStatus")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("BrandBudget.colCampaign")}</th>
                </tr>
              </thead>
              <tbody>
                {activeTx.map((tx) => (
                  <tr key={tx.id} className="border-b border-[#2a2a50]/30">
                    <td className="py-3 pr-4 text-white">
                      {new Date(tx.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 pr-4 text-white">{formatCurrency(tx.amount)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          tx.status === "COMPLETED" || tx.status === "SUCCESS"
                            ? "bg-[#10b981]/10 text-[#10b981]"
                            : "bg-[#f59e0b]/10 text-[#f59e0b]"
                        }`}
                      >
                        {tx.status === "COMPLETED" || tx.status === "SUCCESS" ? t("BrandBudget.statusCompleted") : t("BrandBudget.statusOnProcess")}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#a0a0c0]">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
