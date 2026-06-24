"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Banknote, Smartphone, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { MIN_TOPUP, MAX_TOPUP, MIN_WITHDRAW } from "@/lib/constants";
import { toast } from "sonner";
import { getPayoutHistory, requestPayout } from "@/actions/payout.actions";
import { getCreatorOverview } from "@/actions/creator.actions";
import { createTopUp, getTransactionHistory } from "@/actions/transaction.actions";

type PayoutItem = {
  id: string; amount: number; status: string; payoutMethod: string; accountInfo: string; createdAt: string;
};
type TransactionItem = {
  id: string; amount: number; status: string; paymentMethod: string | null; createdAt: string;
};
type HistoryItem = {
  id: string;
  type: "topup" | "payout";
  amount: number;
  status: string;
  method: string | null;
  date: string;
  info?: string;
};

type HistoryTab = "all" | "topup" | "payout";

export default function ClipperEarnings() {
  const t = useTranslations();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [historyTab, setHistoryTab] = useState<HistoryTab>("all");

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([getPayoutHistory(), getCreatorOverview(), getTransactionHistory()])
      .then(([p, o, tx]) => {
        setPayouts(p as unknown as PayoutItem[]);
        setBalance((o as any).walletBalance || 0);
        setTransactions(tx as unknown as TransactionItem[]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleWithdraw = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await requestPayout({
        amount: Number(formData.get("amount")),
        payoutMethod: formData.get("payoutMethod") as string,
        accountInfo: formData.get("accountInfo") as string,
      });
      toast.success(t("CreatorEarnings.toastWithdrawSuccess"));
      setShowWithdraw(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || t("CreatorEarnings.toastWithdrawFailed"));
    }
  };

  const handleTopUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const amount = Number(formData.get("amount"));
    if (amount < MIN_TOPUP) { toast.error(t("CreatorEarnings.toastTopUpMin", { amount: MIN_TOPUP.toLocaleString() })); return; }
    if (amount > MAX_TOPUP) { toast.error(t("CreatorEarnings.toastTopUpMax", { amount: MAX_TOPUP.toLocaleString() })); return; }
    try {
      const result = await createTopUp(amount);
      if (typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(result.snapToken, {
          onSuccess: () => { toast.success(t("CreatorEarnings.toastTopUpSuccess")); setShowTopUp(false); fetchData(); },
          onPending: () => { toast.info(t("CreatorEarnings.toastTopUpPending")); setShowTopUp(false); fetchData(); },
          onError: () => toast.error(t("CreatorEarnings.toastTopUpFailed")),
          onClose: () => fetchData(),
        });
      } else {
        toast.error(t("CreatorEarnings.toastMidtransLoading"));
      }
    } catch (err: any) { toast.error(err.message || t("CreatorEarnings.toastTransactionFailed")); }
  };

  const allHistory: HistoryItem[] = [
    ...transactions.map((tx) => ({ id: tx.id, type: "topup" as const, amount: tx.amount, status: tx.status, method: tx.paymentMethod, date: tx.createdAt })),
    ...payouts.map((p) => ({ id: p.id, type: "payout" as const, amount: p.amount, status: p.status, method: p.payoutMethod, date: p.createdAt, info: p.accountInfo })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredHistory = historyTab === "all"
    ? allHistory
    : allHistory.filter((h) => h.type === historyTab);

  const payoutStatusConfig: Record<string, { color: string; bg: string; labelKey: string }> = {
    PENDING: { color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", labelKey: "payoutPending" },
    PROCESSING: { color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", labelKey: "payoutProcessing" },
    COMPLETED: { color: "text-[#10b981]", bg: "bg-[#10b981]/10", labelKey: "payoutCompleted" },
    FAILED: { color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", labelKey: "payoutFailed" },
  };

  const historyTabs: { key: HistoryTab; labelKey: string }[] = [
    { key: "all", labelKey: "tabAll" },
    { key: "topup", labelKey: "tabTopUp" },
    { key: "payout", labelKey: "tabPayout" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t("CreatorEarnings.title")}</h1>
        <p className="text-sm text-[#a0a0c0]">{t("CreatorEarnings.subtitle")}</p>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl border border-[#2a2a50] bg-gradient-to-br from-[#6c63ff]/10 to-[#3b82f6]/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#3b82f6]">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-[#a0a0c0]">{t("CreatorEarnings.availableBalance")}</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(balance)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowTopUp(false); setShowWithdraw(!showWithdraw); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <ArrowUpRight className="h-4 w-4" /> {t("CreatorEarnings.withdraw")}
          </button>
          <button
            onClick={() => { setShowWithdraw(false); setShowTopUp(!showTopUp); }}
            className="flex items-center gap-2 rounded-xl border border-[#10b981] px-6 py-2.5 text-sm font-semibold text-[#10b981] hover:bg-[#10b981]/10 transition-colors"
          >
            <ArrowDownLeft className="h-4 w-4" /> {t("CreatorEarnings.topUp")}
          </button>
        </div>
      </div>

      {/* Top-Up Form */}
      {showTopUp && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("CreatorEarnings.topUpTitle")}</h3>
          <form onSubmit={handleTopUp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("CreatorEarnings.topUpAmount")}</label>
              <input type="number" name="amount" defaultValue={50000} className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none" />
              <p className="mt-1 text-xs text-[#a0a0c0]">
                {t("CreatorEarnings.topUpMinMax", { min: formatCurrency(MIN_TOPUP), max: formatCurrency(MAX_TOPUP) })}
              </p>
            </div>
            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              {t("CreatorEarnings.payNow")}
            </button>
          </form>
        </div>
      )}

      {/* Withdraw Form */}
      {showWithdraw && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("CreatorEarnings.withdrawTitle")}</h3>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("CreatorEarnings.amount")}</label>
              <input
                type="number"
                name="amount"
                defaultValue={MIN_WITHDRAW}
                placeholder={t("CreatorEarnings.amountPlaceholder")}
                className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("CreatorEarnings.paymentMethod")}</label>
              <select name="payoutMethod" className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none">
                <option value="BANK">{t("CreatorEarnings.paymentMethodBankTransfer")}</option>
                <option value="GOPAY">{t("CreatorEarnings.paymentMethodGoPay")}</option>
                <option value="OVO">{t("CreatorEarnings.paymentMethodOVO")}</option>
                <option value="DANA">{t("CreatorEarnings.paymentMethodDANA")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("CreatorEarnings.accountInfo")}</label>
              <input
                name="accountInfo"
                placeholder={t("CreatorEarnings.accountInfoPlaceholder")}
                className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none"
              />
            </div>
            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              {t("CreatorEarnings.sendRequest")}
            </button>
          </form>
        </div>
      )}

      {/* Transaction History */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <History className="h-5 w-5" /> {t("CreatorEarnings.transactionHistory")}
        </h3>

        {/* History Tabs */}
        <div className="mb-4 flex gap-2">
          {historyTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setHistoryTab(tab.key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                historyTab === tab.key
                  ? "bg-[#6c63ff] text-white"
                  : "bg-[#0d0d22] text-[#a0a0c0] hover:text-white"
              }`}
            >
              {t(`CreatorEarnings.${tab.labelKey}` as any)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#6c63ff]" /></div>
        ) : filteredHistory.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#a0a0c0]">{t("CreatorEarnings.emptyHistory")}</p>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const config = payoutStatusConfig[item.status] || payoutStatusConfig.PENDING;
              return (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      item.type === "topup" ? "bg-[#10b981]/10" : "bg-[#ef4444]/10"
                    }`}>
                      {item.type === "topup" ? (
                        <ArrowDownLeft className="h-5 w-5 text-[#10b981]" />
                      ) : item.method === "BANK" ? (
                        <Banknote className="h-5 w-5 text-[#ef4444]" />
                      ) : (
                        <Smartphone className="h-5 w-5 text-[#ef4444]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {item.type === "topup" ? "+" : "-"} {formatCurrency(item.amount)}
                      </p>
                      <p className="text-xs text-[#a0a0c0]">
                        {item.type === "topup" ? t("CreatorEarnings.topUpLabel") : item.method}
                        {item.type === "payout" && item.info ? ` · ${item.info}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full ${config.bg} px-3 py-1 text-xs font-medium ${config.color}`}>
                    {t(`CreatorEarnings.${config.labelKey}` as any)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
