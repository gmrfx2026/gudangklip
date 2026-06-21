"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

const INDUSTRIES = [
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

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CREATOR" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(t("Auth.registerSuccess"));
        router.push("/login");
      } else {
        const err = await res.json();
        toast.error(err.message || t("Auth.registerFailed"));
      }
    } catch {
      toast.error(t("Common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white">G</div>
          <span className="text-xl font-bold text-white">GudangKlip</span>
        </Link>
        <div>
          <h2 className="mb-4 text-4xl font-bold text-white">{t("Auth.startEarning")}</h2>
          <p className="text-lg text-white/80">
            {t("Auth.startEarningDesc")}
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: "\uD83D\uDE80", text: t("Auth.registerBullet1") },
            { icon: "\uD83C\uDFAF", text: t("Auth.registerBullet2") },
            { icon: "\uD83D\uDCB0", text: t("Auth.registerBullet3") },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-white/90">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-lg font-bold text-white">G</div>
              <span className="text-xl font-bold text-white">Gudang<span className="gradient-text">Klip</span></span>
            </Link>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">{t("Auth.registerTitle")}</h1>
          <p className="mb-8 text-[#a0a0c0]">
            {t("Auth.haveAccount")}{" "}
            <Link href="/login" className="text-[#6c63ff] hover:underline">{t("Auth.login")}</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#e8e8f0]">{t("Auth.iam")}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "CREATOR", label: t("Auth.roleCreator"), icon: "\uD83C\uDFAC" },
                  { value: "BRAND", label: t("Auth.roleBrand"), icon: "\uD83C\uDFE2" },
                  { value: "AGENCY", label: t("Auth.roleAgency"), icon: "\uD83C\uDF1F" },
                ].map((roleOpt) => (
                  <label
                    key={roleOpt.value}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                      selectedRole === roleOpt.value
                        ? "border-[#6c63ff] bg-[#6c63ff]/10"
                        : "border-[#2a2a50]"
                    }`}
                  >
                    <input
                      type="radio"
                      value={roleOpt.value}
                      {...register("role")}
                      className="sr-only"
                    />
                    <span className="text-xl">{roleOpt.icon}</span>
                    <span className={`text-xs font-medium ${selectedRole === roleOpt.value ? "text-[#6c63ff]" : "text-[#b8b8d0]"}`}>
                      {roleOpt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand-specific fields */}
            {selectedRole === "BRAND" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("Auth.companyName")}</label>
                  <input
                    {...register("companyName")}
                    placeholder={t("Auth.companyNamePlaceholder")}
                    className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
                  />
                  {errors.companyName && <p className="mt-1 text-xs text-red-400">{errors.companyName.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("Auth.industry")}</label>
                  <div className="relative">
                    <select
                      {...register("industry")}
                      className="w-full appearance-none rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
                      defaultValue=""
                    >
                      <option value="" disabled className="bg-[#111128] text-[#a0a0c0]">
                        {t("Auth.industryPlaceholder")}
                      </option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind.value} value={ind.value} className="bg-[#111128] text-white">
                          {ind.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a0a0c0]" />
                  </div>
                  {errors.industry && <p className="mt-1 text-xs text-red-400">{errors.industry.message}</p>}
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("Auth.fullName")}</label>
              <input
                {...register("name")}
                placeholder={t("Auth.fullNamePlaceholder")}
                className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("Auth.email")}</label>
              <input
                {...register("email")}
                type="email"
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("Auth.password")}</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("Auth.passwordPlaceholder")}
                  className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-3 pr-12 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0c0] hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">
                {t("Auth.referralCodeOptional")}
              </label>
              <input
                {...register("referralCode")}
                placeholder={t("Auth.referralCodePlaceholder")}
                className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? t("Common.loading") : (
                <>
                  <UserPlus className="h-4 w-4" /> {t("Auth.registerTitle")}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}