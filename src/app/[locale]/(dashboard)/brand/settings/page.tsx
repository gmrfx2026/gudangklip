"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Loader2, Camera, Save } from "lucide-react";
import { toast } from "sonner";
import { getBrandProfile, updateBrandProfile, updateProfileImage } from "@/actions/profile.actions";

const INDUSTRY_OPTIONS = [
  { value: "E_COMMERCE", label: "E-Commerce" },
  { value: "FOOD_BEVERAGE", label: "Food & Beverage" },
  { value: "FASHION_BEAUTY", label: "Fashion & Beauty" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "FINANCE", label: "Finance" },
  { value: "HEALTH_WELLNESS", label: "Health & Wellness" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "EDUCATION", label: "Education" },
  { value: "TRAVEL_HOSPITALITY", label: "Travel & Hospitality" },
  { value: "OTHER", label: "Other" },
];

type ProfileData = {
  id: string;
  name: string;
  image: string | null;
  companyName: string | null;
  industry: string | null;
  createdAt: string;
};

export default function BrandSettings() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formIndustry, setFormIndustry] = useState("");

  useEffect(() => {
    getBrandProfile()
      .then((data) => {
        const d = data as unknown as ProfileData | null;
        setProfile(d);
        if (d) {
          setFormName(d.name || "");
          setFormCompany(d.companyName || "");
          setFormIndustry(d.industry || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      await updateProfileImage(json.url);
      setProfile((prev) => prev ? { ...prev, image: json.url } : null);
      toast.success(t("BrandSettings.toastSuccessProfile"));
    } catch (err: any) {
      toast.error(err.message || t("BrandSettings.toastFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBrandProfile({
        name: formName,
        companyName: formCompany,
        industry: formIndustry,
      });
      toast.success(t("BrandSettings.toastSuccessProfile"));
    } catch (err: any) {
      toast.error(err.message || t("BrandSettings.toastFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
      </div>
    );
  }

  if (!profile) return null;

  const joinDate = new Date(profile.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t("BrandSettings.title")}</h2>
        <p className="text-[#a0a0c0]">{t("BrandSettings.subtitle")}</p>
      </div>

      {/* Logo + Brand Info */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6c63ff]/20 to-[#3b82f6]/20 overflow-hidden">
              {profile.image ? (
                <img src={profile.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#6c63ff]">
                  {profile.name?.charAt(0) || "?"}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#6c63ff] text-white hover:bg-[#5b52ef] transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{t("BrandSettings.brandName")}: {profile.name}</p>
            <p className="text-sm text-[#a0a0c0]">{t("BrandSettings.joined")}: {joinDate}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden">
        <div className="flex border-b border-[#2a2a50]">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-[#6c63ff] text-[#6c63ff] bg-[#6c63ff]/5"
                : "text-[#a0a0c0] hover:text-white"
            }`}
          >
            {t("BrandSettings.companyProfileTab")}
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "security"
                ? "border-b-2 border-[#6c63ff] text-[#6c63ff] bg-[#6c63ff]/5"
                : "text-[#a0a0c0] hover:text-white"
            }`}
          >
            {t("BrandSettings.securityTab")}
          </button>
        </div>

        <div className="p-6">
          {activeTab === "profile" ? (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#a0a0c0]">
                  {t("BrandSettings.companyName")}
                </label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder={t("BrandSettings.companyNamePlaceholder")}
                  className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-2.5 text-sm text-white placeholder:text-[#6b7280] focus:border-[#6c63ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#a0a0c0]">
                  {t("BrandSettings.industry")}
                </label>
                <select
                  value={formIndustry}
                  onChange={(e) => setFormIndustry(e.target.value)}
                  className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-2.5 text-sm text-white focus:border-[#6c63ff] focus:outline-none"
                >
                  <option value="">{t("BrandSettings.industryPlaceholder")}</option>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t("BrandSettings.saveChanges")}
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#a0a0c0]">
                  {t("BrandSettings.currentPassword")}
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-2.5 text-sm text-white placeholder:text-[#6b7280] focus:border-[#6c63ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#a0a0c0]">
                  {t("BrandSettings.newPassword")}
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-2.5 text-sm text-white placeholder:text-[#6b7280] focus:border-[#6c63ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#a0a0c0]">
                  {t("BrandSettings.confirmNewPassword")}
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-2.5 text-sm text-white placeholder:text-[#6b7280] focus:border-[#6c63ff] focus:outline-none"
                />
              </div>
              <button
                onClick={() => toast.success(t("BrandSettings.toastSuccessPassword"))}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                {t("BrandSettings.updatePassword")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
