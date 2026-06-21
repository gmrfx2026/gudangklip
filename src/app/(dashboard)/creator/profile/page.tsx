"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Check, Plus, Loader2, Camera } from "lucide-react";
import { PLATFORMS } from "@/lib/constants";
import { toast } from "sonner";
import { getSocialAccounts, connectSocialAccount } from "@/actions/auth.actions";
import { getCreatorOverview } from "@/actions/creator.actions";
import { updateProfileImage } from "@/actions/profile.actions";

type SocialAccountItem = {
  id: string;
  platform: string;
  username: string;
  verified: boolean;
};

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConnect, setShowConnect] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccountItem[]>([]);
  const [trustScore, setTrustScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getSocialAccounts(), getCreatorOverview()])
      .then(([accs, overview]) => {
        setSocialAccounts(accs as unknown as SocialAccountItem[]);
        setTrustScore((overview as any).trustScore || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload gagal");

      await updateProfileImage(data.url);
      await updateSession();
      toast.success("Foto profil diperbarui!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal upload foto");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const platform = formData.get("platform") as string;
    const username = formData.get("username") as string;

    if (!username) { toast.error("Username wajib diisi"); return; }

    setConnecting(true);
    try {
      await connectSocialAccount({ platform, username });
      toast.success("Akun berhasil dihubungkan!");
      setShowConnect(false);
      form.reset();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghubungkan akun");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Profile</h2>
        <p className="text-[#8888aa]">Kelola akun dan sosial media kamu.</p>
      </div>

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-2xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity group"
          >
            {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name || ""} className="h-full w-full rounded-full object-cover" />
            ) : (
              session?.user?.name?.charAt(0) || "?"
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-5 w-5" />}
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <div>
            <h3 className="text-xl font-bold text-white">{session?.user?.name || "User"}</h3>
            <p className="text-[#8888aa]">{session?.user?.email}</p>
            <div className="mt-2 flex items-center gap-4">
              <span className="rounded-full bg-[#6c63ff]/10 px-3 py-0.5 text-xs font-medium text-[#6c63ff]">Creator</span>
              <span className="text-xs text-[#8888aa]">Trust Score: {trustScore}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Akun Sosial Media</h3>
          <button
            onClick={() => setShowConnect(!showConnect)}
            className="flex items-center gap-1 text-sm font-medium text-[#6c63ff] hover:underline"
          >
            <Plus className="h-4 w-4" /> Hubungkan Akun
          </button>
        </div>

        {showConnect && (
          <div className="mb-6 rounded-xl border border-[#2a2a50] bg-[#0d0d22] p-4">
            <form onSubmit={handleConnect} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#e8e8f0]">Platform</label>
                <select name="platform" className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-2.5 text-sm text-white focus:border-[#6c63ff] focus:outline-none">
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#e8e8f0]">Username</label>
                <input name="username" placeholder="@username" className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-2.5 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none" />
              </div>
              <button type="submit" disabled={connecting} className="rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                {connecting ? "Menghubungkan..." : "Hubungkan"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#6c63ff]" />
          </div>
        ) : socialAccounts.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8888aa]">Belum ada akun sosial media terhubung.</p>
        ) : (
          <div className="space-y-3">
            {socialAccounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between rounded-xl bg-[#0d0d22] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6c63ff]/10 text-lg">
                    {acc.platform === "INSTAGRAM" ? "\uD83D\uDCF7" : acc.platform === "YOUTUBE" ? "\u25B6\uFE0F" : "\uD83C\uDFB5"}
                  </div>
                  <div>
                    <p className="font-medium text-white">{PLATFORMS.find((p) => p.value === acc.platform)?.label}</p>
                    <p className="text-sm text-[#8888aa]">{acc.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {acc.verified && (
                    <span className="flex items-center gap-1 rounded-full bg-[#10b981]/10 px-2.5 py-1 text-xs font-medium text-[#10b981]">
                      <Check className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
