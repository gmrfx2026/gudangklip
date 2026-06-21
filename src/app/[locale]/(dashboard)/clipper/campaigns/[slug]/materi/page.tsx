"use client";

import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";

export default function MateriPage() {
  const params = useParams();
  const slug = params.slug as string;

  const materials = [
    { name: "Logo Brand", type: "PNG/SVG", description: "Logo resmi brand untuk digunakan di video" },
    { name: "Footage Produk", type: "MP4", description: "Footage produk yang bisa di-remix" },
    { name: "Background Music", type: "MP3", description: "Musik yang disarankan untuk video" },
    { name: "Overlay Template", type: "PSD/PNG", description: "Template overlay untuk video" },
  ];

  return (
    <div className="max-w-3xl">
      <Link href={`/clipper/campaigns/${slug}`} className="mb-4 inline-flex items-center gap-1 text-sm text-[#a0a0c0] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <div className="mb-6">
        <p className="text-sm text-[#6b7280]">Materi Clipping Campaigns:</p>
        <h1 className="text-2xl font-bold text-white">{slug.replace(/-/g, " ")}</h1>
      </div>

      <div className="space-y-3">
        {materials.map((m, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-[#2a2a50] bg-[#111128]/50 p-4">
            <div>
              <h3 className="font-medium text-white">{m.name}</h3>
              <p className="text-xs text-[#a0a0c0]">{m.type} &middot; {m.description}</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a50] px-3 py-1.5 text-xs text-[#a0a0c0] hover:bg-[#1e1e3f] hover:text-white">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-[#6b7280]">Materi akan tersedia setelah kamu join campaign.</p>
    </div>
  );
}
