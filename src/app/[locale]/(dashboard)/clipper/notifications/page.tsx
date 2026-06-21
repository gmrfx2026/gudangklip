"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Loader2, CheckCheck } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  link: string;
  category: "campaign" | "akun";
  read: boolean;
};

export default function ClipperNotifications() {
  const [filter, setFilter] = useState<"semua" | "belum" | "campaigns" | "akun">("semua");
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Berhasil join campaign!",
      body: "Kamu udah join campaign dari brand. Yuk mulai bikin clip dan submit videonya ya kak!",
      time: "1m ago",
      link: "/clipper/campaigns",
      category: "campaign",
      read: false,
    },
    {
      id: "2",
      title: "Selamat datang di GudangKlip!",
      body: "Halo! Selamat bergabung di GudangKlip. Mulai eksplor campaign dan dapatkan penghasilan dari setiap views video kamu.",
      time: "1d ago",
      link: "/clipper",
      category: "akun",
      read: true,
    },
  ]);

  const filters = [
    { key: "semua" as const, label: "Semua" },
    { key: "belum" as const, label: "Belum dibaca" },
    { key: "campaigns" as const, label: "Campaigns" },
    { key: "akun" as const, label: "Akun" },
  ];

  const filtered = notifications.filter((n) => {
    if (filter === "belum") return !n.read;
    if (filter === "campaigns") return n.category === "campaign";
    if (filter === "akun") return n.category === "akun";
    return true;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notifikasi</h1>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border border-[#2a2a50] bg-[#0d0d22] p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-[#6c63ff] text-white" : "text-[#a0a0c0] hover:text-white"}`}
            >{f.label}</button>
          ))}
        </div>
        <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[#a0a0c0] hover:text-white">
          <CheckCheck className="h-3.5 w-3.5" /> Tandai semua dibaca
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[#6b7280]">Belum ada notifikasi.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <Link key={n.id} href={n.link} className={`block rounded-xl border p-4 transition-colors ${n.read ? "border-[#2a2a50] bg-[#111128]/30" : "border-[#6c63ff]/30 bg-[#111128]/50 hover:border-[#6c63ff]/50"}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${n.read ? "bg-[#1e1e3f]" : "bg-[#6c63ff]/20"}`}>
                  <span className="text-sm">{n.read ? "O" : "N"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-white">{n.title}</h3>
                    <span className="text-[10px] text-[#6b7280]">{n.time}</span>
                  </div>
                  <p className="text-xs text-[#a0a0c0]">{n.body}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
