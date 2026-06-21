"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Apa itu GudangKlip?",
    a: "GudangKlip adalah platform kliping video yang menghubungkan Brand dengan Clipper. Brand membuat campaign, Clipper membuat video pendek (TikTok, Instagram Reels, YouTube Shorts) untuk campaign tersebut dan mendapatkan penghasilan berdasarkan jumlah views.",
  },
  {
    q: "Bagaimana cara mendapatkan penghasilan?",
    a: "1. Join campaign yang tersedia di halaman Campaigns. 2. Baca brief dan materi campaign. 3. Buat video sesuai brief. 4. Submit video melalui halaman campaign detail. 5. Dapatkan penghasilan berdasarkan CPM (Cost Per 1000 Views) dari setiap views video kamu.",
  },
  {
    q: "Berapa minimal penarikan dana?",
    a: "Minimal penarikan dana adalah Rp 50.000. Kamu bisa menarik dana melalui Bank Transfer (BCA, BRI, Mandiri), GoPay, OVO, atau DANA.",
  },
  {
    q: "Platform apa saja yang didukung?",
    a: "GudangKlip mendukung 3 platform: TikTok, Instagram (Reels), dan YouTube (Shorts). Kamu bisa menghubungkan akun social media kamu di halaman Profile.",
  },
  {
    q: "Bagaimana cara menghubungi admin?",
    a: "Kamu bisa menghubungi admin melalui WhatsApp di nomor yang tersedia di sidebar atau klik menu Hubungi Admin. Tim kami siap membantu kamu!",
  },
];

export default function ClipperRules() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">FaQ & Peraturan</h1>
        <p className="text-[#a0a0c0]">Pertanyaan umum dan aturan platform</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-white">{faq.q}</span>
              <ChevronDown className={`h-4 w-4 text-[#a0a0c0] transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4">
                <p className="text-sm text-[#a0a0c0] whitespace-pre-line">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-white">Aturan Platform</h3>
        <ul className="space-y-2 text-sm text-[#a0a0c0] list-disc pl-5">
          <li>Konten harus original, tidak boleh mencuri atau reupload konten orang lain.</li>
          <li>Video harus sesuai dengan brief campaign yang diikuti.</li>
          <li>Dilarang menggunakan bot atau cara curang untuk meningkatkan views.</li>
          <li>Dilarang membuat konten yang mengandung SARA, pornografi, atau ujaran kebencian.</li>
          <li>Setiap pelanggaran akan mengakibatkan pembekuan akun dan kehilangan saldo.</li>
        </ul>
      </div>
    </div>
  );
}
