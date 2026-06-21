"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Banknote, Smartphone, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { MIN_TOPUP, MAX_TOPUP } from "@/lib/constants";
import { toast } from "sonner";
import { getPayoutHistory, requestPayout } from "@/actions/payout.actions";
import { getCreatorOverview } from "@/actions/creator.actions";
import { createTopUp, getTransactionHistory } from "@/actions/transaction.actions";

type PayoutItem = {
  id: string;
  amount: number;
  status: string;
  payoutMethod: string;
  accountInfo: string;
  createdAt: string;
};

type TransactionItem = {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
};

const payoutStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", label: "Pending" },
  PROCESSING: { color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", label: "Processing" },
  COMPLETED: { color: "text-[#10b981]", bg: "bg-[#10b981]/10", label: "Completed" },
  FAILED: { color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", label: "Failed" },
};

const txnStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", label: "Pending" },
  SUCCESS: { color: "text-[#10b981]", bg: "bg-[#10b981]/10", label: "Success" },
  FAILED: { color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", label: "Failed" },
};

export default function WalletPage() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [toppingUp, setToppingUp] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([getPayoutHistory(), getCreatorOverview(), getTransactionHistory()])
      .then(([p, o, t]) => {
        setPayouts(p as unknown as PayoutItem[]);
        setBalance((o as any).walletBalance || 0);
        setTransactions(t as unknown as TransactionItem[]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleWithdraw = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const amount = Number(formData.get("amount"));
    const payoutMethod = formData.get("payoutMethod") as string;
    const accountInfo = formData.get("accountInfo") as string;

    setWithdrawing(true);
    try {
      await requestPayout({ amount, payoutMethod, accountInfo });
      toast.success("Permintaan penarikan berhasil dikirim!");
      setShowWithdraw(false);
      form.reset();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan penarikan");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const amount = Number(formData.get("amount"));

    if (amount < MIN_TOPUP) {
      toast.error(`Minimal top-up Rp ${MIN_TOPUP.toLocaleString()}`);
      return;
    }
    if (amount > MAX_TOPUP) {
      toast.error(`Maksimal top-up Rp ${MAX_TOPUP.toLocaleString()}`);
      return;
    }

    setToppingUp(true);
    try {
      const result = await createTopUp(amount);
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
      if (typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(result.snapToken, {
          onSuccess: () => {
            toast.success("Top-up berhasil!");
            setShowTopUp(false);
            form.reset();
            fetchData();
          },
          onPending: () => {
            toast.info("Pembayaran pending, menunggu konfirmasi.");
            setShowTopUp(false);
            form.reset();
            fetchData();
          },
          onError: () => {
            toast.error("Pembayaran gagal, silakan coba lagi.");
          },
          onClose: () => {
            fetchData();
          },
        });
      } else {
        toast.info("Midtrans Snap sedang dimuat, silakan coba lagi.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat transaksi");
    } finally {
      setToppingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Wallet</h2>
        <p className="text-[#8888aa]">Kelola saldo dan pencairan dana kamu.</p>
      </div>

      <div className="rounded-2xl border border-[#2a2a50] bg-gradient-to-br from-[#6c63ff]/10 to-[#3b82f6]/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#3b82f6]">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-[#8888aa]">Saldo Tersedia</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(balance)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowTopUp(false); setShowWithdraw(!showWithdraw); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <ArrowUpRight className="h-4 w-4" /> Tarik Dana
          </button>
          <button
            onClick={() => { setShowWithdraw(false); setShowTopUp(!showTopUp); }}
            className="flex items-center gap-2 rounded-xl border border-[#10b981] px-6 py-2.5 text-sm font-semibold text-[#10b981] hover:bg-[#10b981]/10 transition-colors"
          >
            <ArrowDownLeft className="h-4 w-4" /> Isi Saldo
          </button>
        </div>
      </div>

      {showTopUp && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Isi Saldo</h3>
          <form onSubmit={handleTopUp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">Jumlah Top-Up</label>
              <input
                type="number"
                name="amount"
                placeholder={`Min. ${formatCurrency(MIN_TOPUP)}`}
                defaultValue={50000}
                className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none"
              />
              <p className="mt-1 text-xs text-[#8888aa]">Min: {formatCurrency(MIN_TOPUP)} &middot; Max: {formatCurrency(MAX_TOPUP)}</p>
            </div>
            <button type="submit" disabled={toppingUp} className="w-full rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
              {toppingUp ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </form>
        </div>
      )}

      {showWithdraw && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Tarik Dana</h3>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">Jumlah</label>
              <input
                type="number"
                name="amount"
                placeholder="Min. Rp 50.000"
                defaultValue={50000}
                className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">Metode Pembayaran</label>
              <select name="payoutMethod" className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none">
                <option value="BANK">Bank Transfer (BCA, BRI, Mandiri)</option>
                <option value="GOPAY">GoPay</option>
                <option value="OVO">OVO</option>
                <option value="DANA">DANA</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">Info Akun</label>
              <input
                name="accountInfo"
                placeholder="Contoh: BCA 1234567890 a/n Nama"
                className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none"
              />
            </div>
            <button type="submit" disabled={withdrawing} className="w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
              {withdrawing ? "Mengirim..." : "Kirim Permintaan"}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <History className="h-5 w-5" /> Riwayat Transaksi
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#6c63ff]" />
          </div>
        ) : (transactions.length === 0 && payouts.length === 0) ? (
          <p className="py-8 text-center text-sm text-[#8888aa]">Belum ada riwayat transaksi.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => {
              const config = txnStatusConfig[t.status] || txnStatusConfig.PENDING;
              return (
                <div key={t.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10b981]/10">
                      <ArrowDownLeft className="h-5 w-5 text-[#10b981]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">+ {formatCurrency(t.amount)}</p>
                      <p className="text-xs text-[#8888aa]">Top-Up {t.paymentMethod ? `via ${t.paymentMethod}` : ""}</p>
                    </div>
                  </div>
                  <span className={`rounded-full ${config.bg} px-3 py-1 text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
            {payouts.map((p) => {
              const config = payoutStatusConfig[p.status];
              return (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef4444]/10">
                      {p.payoutMethod === "BANK" ? (
                        <Banknote className="h-5 w-5 text-[#ef4444]" />
                      ) : (
                        <Smartphone className="h-5 w-5 text-[#ef4444]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">- {formatCurrency(p.amount)}</p>
                      <p className="text-xs text-[#8888aa]">{p.payoutMethod} &middot; {p.accountInfo}</p>
                    </div>
                  </div>
                  <span className={`rounded-full ${config.bg} px-3 py-1 text-xs font-medium ${config.color}`}>
                    {config.label}
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
