"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Banknote, Smartphone, CheckCircle, XCircle, Clock, Loader } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { getAllPayouts, processPayout } from "@/actions/admin.actions";

type PayoutItem = {
  id: string;
  amount: number;
  status: string;
  payoutMethod: string;
  accountInfo: string;
  createdAt: string;
  creator: { id: string; name: string; email: string };
};

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  PENDING: { color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", label: "Pending", icon: <Clock className="h-4 w-4" /> },
  PROCESSING: { color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", label: "Processing", icon: <Loader className="h-4 w-4 animate-spin" /> },
  COMPLETED: { color: "text-[#10b981]", bg: "bg-[#10b981]/10", label: "Completed", icon: <CheckCircle className="h-4 w-4" /> },
  FAILED: { color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", label: "Failed", icon: <XCircle className="h-4 w-4" /> },
};

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPayouts = useCallback(() => {
    setLoading(true);
    getAllPayouts()
      .then((data) => setPayouts(data as unknown as PayoutItem[]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const handleProcess = async (payoutId: string, status: "PROCESSING" | "COMPLETED" | "FAILED") => {
    setProcessing(payoutId);
    try {
      await processPayout(payoutId, status);
      toast.success("Status pencairan berhasil diupdate");
      fetchPayouts();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate status");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = filter
    ? payouts.filter((p) => p.status === filter)
    : payouts;

  const statusCounts = payouts.reduce(
    (acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Payout Management</h2>
        <p className="text-[#8888aa]">Review dan proses permintaan pencairan dana creator.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        <button onClick={() => setFilter("")} className={`rounded-xl px-4 py-2 text-xs font-medium whitespace-nowrap ${!filter ? "bg-[#6c63ff] text-white" : "border border-[#2a2a50] text-[#b8b8d0]"}`}>
          Semua ({payouts.length})
        </button>
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = statusConfig[status];
          return (
            <button key={status} onClick={() => setFilter(status)} className={`rounded-xl px-4 py-2 text-xs font-medium whitespace-nowrap ${filter === status ? "bg-[#6c63ff] text-white" : "border border-[#2a2a50] text-[#b8b8d0]"}`}>
              {config?.label || status} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-[#8888aa]">
          <p className="text-lg">Tidak ada pencairan.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#2a2a50]">
                <tr className="text-left text-xs font-medium text-[#8888aa]">
                  <th className="px-6 py-4">Creator</th>
                  <th className="px-6 py-4">Jumlah</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4">Info Akun</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const config = statusConfig[p.status] || statusConfig.PENDING;
                  return (
                    <tr key={p.id} className="border-b border-[#2a2a50]/50 text-sm hover:bg-[#1e1e3f]/20">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{p.creator.name}</p>
                        <p className="text-xs text-[#8888aa]">{p.creator.email}</p>
                      </td>
                      <td className="px-6 py-4 text-[#10b981] font-medium">{formatCurrency(p.amount)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {p.payoutMethod === "BANK" ? <Banknote className="h-4 w-4 text-[#8888aa]" /> : <Smartphone className="h-4 w-4 text-[#8888aa]" />}
                          <span className="text-white">{p.payoutMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#8888aa]">{p.accountInfo}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 rounded-full ${config.bg} px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                          {config.icon} {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleProcess(p.id, "PROCESSING")}
                              disabled={processing === p.id}
                              className="rounded-lg bg-[#3b82f6]/10 px-2.5 py-1 text-xs font-medium text-[#3b82f6] hover:bg-[#3b82f6]/20 disabled:opacity-50"
                            >
                              Process
                            </button>
                            <button
                              onClick={() => handleProcess(p.id, "FAILED")}
                              disabled={processing === p.id}
                              className="rounded-lg bg-[#ef4444]/10 px-2.5 py-1 text-xs font-medium text-[#ef4444] hover:bg-[#ef4444]/20 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {p.status === "PROCESSING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleProcess(p.id, "COMPLETED")}
                              disabled={processing === p.id}
                              className="rounded-lg bg-[#10b981]/10 px-2.5 py-1 text-xs font-medium text-[#10b981] hover:bg-[#10b981]/20 disabled:opacity-50"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleProcess(p.id, "FAILED")}
                              disabled={processing === p.id}
                              className="rounded-lg bg-[#ef4444]/10 px-2.5 py-1 text-xs font-medium text-[#ef4444] hover:bg-[#ef4444]/20 disabled:opacity-50"
                            >
                              Fail
                            </button>
                          </div>
                        )}
                        {p.status === "COMPLETED" && (
                          <span className="text-xs text-[#10b981]">Done</span>
                        )}
                        {p.status === "FAILED" && (
                          <span className="text-xs text-[#ef4444]">Refunded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
