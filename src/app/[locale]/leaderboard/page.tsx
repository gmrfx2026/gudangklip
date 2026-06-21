"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Trophy, Medal, Star, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { getLeaderboard } from "@/actions/leaderboard.actions";

type Leader = {
  id: string;
  name: string;
  trustScore: number;
  totalViews: number;
  totalEarnings: number;
};

export default function LeaderboardPage() {
  const t = useTranslations();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((data) => setLeaders(data as unknown as Leader[]))
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-[#f59e0b]" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-[#b8b8d0]" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-[#cd7f32]" />;
    return <span className="text-sm font-bold text-[#8888aa]">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <nav className="fixed top-0 z-50 w-full border-b border-[#2a2a50]/50 bg-[#0a0a1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-sm font-bold text-white">G</div>
            <span className="text-lg font-bold text-white">Gudang<span className="gradient-text">Klip</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#b8b8d0] hover:text-white">{t("Landing.navLogin")}</Link>
            <Link href="/register" className="rounded-full bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2 text-sm font-semibold text-white hover:opacity-90">{t("Landing.navRegister")}</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white">{t("Leaderboard.title")}</h1>
            <p className="text-[#b8b8d0]">{t("Leaderboard.subtitle")}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
            </div>
          ) : leaders.length === 0 ? (
            <div className="py-20 text-center text-[#8888aa]">
              <p className="text-lg">{t("Leaderboard.noData")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaders.map((l, i) => {
                const rank = i + 1;
                return (
                  <div key={l.id} className={`rounded-2xl border p-4 ${rank <= 3 ? "border-[#6c63ff]/30 bg-[#6c63ff]/5" : "border-[#2a2a50] bg-[#111128]/50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center">{getRankIcon(rank)}</div>
                        <div>
                          <p className="font-semibold text-white">{l.name}</p>
                          <div className="flex items-center gap-2 text-xs text-[#8888aa]">
                            <Star className="h-3 w-3 fill-[#f59e0b] text-[#f59e0b]" />
                            {t("Leaderboard.trustScore", { score: l.trustScore })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#10b981]">{formatCurrency(l.totalEarnings)}</p>
                        <p className="text-xs text-[#8888aa]">{formatCompactNumber(l.totalViews)} {t("Leaderboard.views")}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
