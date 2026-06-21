"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, X, Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export default function BriefPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeSubTab, setActiveSubTab] = useState("syarat");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Berhasil disalin!");
    setTimeout(() => setCopied(null), 2000);
  };

  const subTabs = [
    { key: "syarat", label: "Syarat" },
    { key: "aturan", label: "Aturan" },
    { key: "narasi", label: "Narasi" },
    { key: "caption", label: "Caption" },
    { key: "tentang", label: "Tentang" },
  ];

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <Link href={`/clipper/campaigns/${slug}`} className="mb-4 inline-flex items-center gap-1 text-sm text-[#a0a0c0] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <div className="mb-6">
        <p className="text-sm text-[#6b7280]">Materi Clipping Campaigns:</p>
        <h1 className="text-2xl font-bold text-white">{slug.replace(/-/g, " ")}</h1>
        <p className="text-xs text-[#6b7280]">Dibuat pada Jun 2026</p>
      </div>

      {/* Sub Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveSubTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeSubTab === t.key ? "bg-[#6c63ff] text-white" : "border border-[#2a2a50] text-[#a0a0c0] hover:bg-[#1e1e3f]"
            }`}
          >{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeSubTab === "syarat" && (
          <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50">
            <div className="border-b border-[#2a2a50] px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Syarat akun</span>
                  <span className="ml-2 text-xs text-[#f59e0b]">2 wajib</span>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium text-[#a0a0c0]">Minimum Followers*</p>
                <p className="text-white">10 Followers</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-[#a0a0c0]">Niche akun yang diperbolehkan*</p>
                <p className="text-white">Lifestyle, Entertainment</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "aturan" && (
          <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50">
            <div className="border-b border-[#2a2a50] px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Aturan konten</span>
                  <span className="ml-2 text-xs text-[#f59e0b]">4 wajib</span>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium text-[#a0a0c0]">Platform yang diperbolehkan*</p>
                <div className="flex gap-3">
                  <span className="text-white">TikTok</span>
                  <span className="text-white">Instagram</span>
                  <span className="text-white">YouTube</span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-[#a0a0c0]">Durasi video*</p>
                <p className="text-white">10 – 120 detik</p>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-[#a0a0c0]">Elemen wajib*</p>
                <div className="space-y-2">
                  {["Hook curiosity di 3 detik pertama", "Reveal produk setelah hook", "Tekstur produk ditampilkan jelas", "Produk terlihat + sebut varian"].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />
                      <span className="text-sm text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-[#a0a0c0]">Do & don&apos;ts*</p>
                <div className="space-y-2">
                  {[
                    { type: "do", text: "Konten fun, relatable, mancing penasaran" },
                    { type: "do", text: "Highlight keunikan produk" },
                    { type: "do", text: "Fokus ke hook yang bikin orang berhenti scroll" },
                    { type: "do", text: "Bebas berkreasi angle/hook sendiri" },
                    { type: "do", text: "Buka dengan rasa penasaran" },
                    { type: "dont", text: "Jangan buka pakai klaim teknis" },
                    { type: "dont", text: "Jangan bikin sentimen/komentar negatif" },
                    { type: "dont", text: "Jangan pakai klaim yang tidak sesuai info produk" },
                    { type: "dont", text: "Jaga kolom komentar, hapus komentar negatif" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {item.type === "do" ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-[#ef4444]" />
                      )}
                      <span className="text-sm text-white">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "narasi" && (
          <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50">
            <div className="border-b border-[#2a2a50] px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Narasi & pesan</span>
                  <span className="ml-2 text-xs text-[#f59e0b]">4 wajib</span>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-[#a0a0c0]">Narasi wajib yang harus sampai ke penonton*</p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li className="text-sm text-white">Keunikan produk yang beda dari yang lain</li>
                  <li className="text-sm text-white">Bisa dipakai sebagai face wash sekaligus face mask</li>
                  <li className="text-sm text-white">Hadir dalam 2 varian unik</li>
                  <li className="text-sm text-white">Produk yang fun dan beda</li>
                  <li className="text-sm text-white">Tetap punya manfaat skincare yang nyata</li>
                </ol>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-[#a0a0c0]">Kesan yang diinginkan*</p>
                <p className="text-white">Curious - Fomo - Surprise - Soft Selling</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-[#a0a0c0]">Tujuan campaign*</p>
                <p className="text-white">Brand awareness: orang tahu brand/konten</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-[#a0a0c0]">CTA (ajakan di akhir video)*</p>
                <p className="text-white">Penasaran? Cobain sendiri produknya sekarang juga!</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "caption" && (
          <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50">
            <div className="border-b border-[#2a2a50] px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Caption, hashtag & tag</span>
                  <span className="ml-2 text-xs text-[#f59e0b]">3 wajib</span>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-[#a0a0c0]">Caption wajib*</p>
                <div className="flex items-center justify-between rounded-lg bg-[#0d0d22] p-3">
                  <p className="text-sm text-white">-</p>
                  <button onClick={() => copyToClipboard("-", "caption")} className="text-[#6c63ff] hover:text-white">
                    {copied === "caption" ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-[#a0a0c0]">Hashtag wajib*</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["#Aqeela", "#EminaGelato", "#Emina"].map((tag) => (
                    <span key={tag} className="rounded-full bg-[#1e1e3f] px-3 py-1 text-xs text-white">{tag}</span>
                  ))}
                </div>
                <button onClick={() => copyToClipboard("#Aqeela #EminaGelato #Emina", "hashtags")} className="text-xs text-[#6c63ff] hover:underline">
                  {copied === "hashtags" ? "Tersalin!" : "Copy semua hashtag"}
                </button>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-[#a0a0c0]">Tag social media wajib*</p>
                <div className="space-y-2">
                  {["TikTok", "Instagram", "YouTube"].map((p) => (
                    <div key={p} className="flex items-center gap-2">
                      <span className="text-sm text-[#a0a0c0]">{p}:</span>
                      <span className="text-sm text-white">-</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "tentang" && (
          <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50">
            <div className="border-b border-[#2a2a50] px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Tentang campaign</span>
                  <span className="ml-2 text-xs text-[#f59e0b]">1 wajib</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="mb-1 text-sm font-medium text-[#a0a0c0]">Target audiens utama*</p>
              <p className="text-white">13–17, 18–24, 25–34</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
