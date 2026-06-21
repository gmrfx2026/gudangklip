"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Camera, MapPin, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCreatorOverview } from "@/actions/creator.actions";
import { toast } from "sonner";

export default function ClipperSettings() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"profil" | "akun" | "verifikasi" | "keamanan">("profil");
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState(session?.user?.name || "");

  useEffect(() => {
    getCreatorOverview()
      .then((d) => setEarnings((d as any).totalEarnings || 0))
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: "profil" as const, label: "Profil" },
    { key: "akun" as const, label: "Akun" },
    { key: "verifikasi" as const, label: "Verifikasi" },
    { key: "keamanan" as const, label: "Keamanan" },
  ];

  const joinDate = "Jun 2026";

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden">
        <div className="flex h-24 items-center justify-center bg-gradient-to-r from-[#6c63ff]/20 to-[#3b82f6]/10">
          <span className="text-xs text-[#a0a0c0]">made to spread.</span>
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-8 flex items-end gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#0a0a1a] bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-lg font-bold text-white">
                {session?.user?.name?.charAt(0) || "?"}
              </div>
              <button className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#6c63ff] text-white hover:bg-[#3b82f6]">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{session?.user?.name || "Clipper"}</h2>
                <button className="text-[#6c63ff] hover:underline text-sm">Edit</button>
              </div>
              <p className="text-xs text-[#a0a0c0]">Bergabung {joinDate}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#a0a0c0]">Total Pendapatan</p>
              <p className="text-lg font-bold text-white">{formatCurrency(earnings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#2a2a50] bg-[#0d0d22] p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === t.key ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"}`}
          >{t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "profil" && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama Lengkap"
              className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">Location</label>
            <div className="flex gap-2">
              <input
                placeholder="Klik tombol untuk deteksi otomatis"
                className="flex-1 rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none"
              />
              <button className="flex items-center gap-1.5 rounded-xl border border-[#2a2a50] px-4 py-3 text-sm text-[#a0a0c0] hover:bg-[#1e1e3f]">
                <MapPin className="h-4 w-4" /> Deteksi
              </button>
            </div>
          </div>
          <button className="rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90">Save Changes</button>
        </div>
      )}

      {activeTab === "akun" && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e1e3f] text-lg">G</div>
              <div>
                <p className="font-medium text-white">Login dengan Google</p>
                <p className="text-xs text-[#a0a0c0]">Hubungkan akun Google supaya bisa login pakai Google selain email & password.</p>
              </div>
            </div>
            <button className="rounded-xl border border-[#2a2a50] px-4 py-2 text-sm text-[#a0a0c0] hover:bg-[#1e1e3f]">Hubungkan Google</button>
          </div>
        </div>
      )}

      {activeTab === "verifikasi" && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-12 text-center">
          <p className="text-[#6b7280]">Fitur verifikasi akan segera hadir.</p>
        </div>
      )}

      {activeTab === "keamanan" && (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-12 text-center">
          <p className="text-[#6b7280]">Pengaturan keamanan akan segera hadir.</p>
        </div>
      )}
    </div>
  );
}
