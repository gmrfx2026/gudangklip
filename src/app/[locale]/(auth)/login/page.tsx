"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t("Auth.loginError"));
      } else {
        toast.success(t("Auth.loginSuccess"));
        router.push("/creator");
        router.refresh();
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white">
            G
          </div>
          <span className="text-xl font-bold text-white">GudangKlip</span>
        </Link>
        <div>
          <h2 className="mb-4 text-4xl font-bold text-white">{t("Auth.welcomeBack")}</h2>
          <p className="text-lg text-white/80">
            {t("Auth.welcomeBackDesc")}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "Rp 1M+", label: t("Landing.statBudget") },
            { value: "300K+", label: t("Brand.activeCreators") },
            { value: "3 Hari", label: t("Landing.statPayout") },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/10 p-4">
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-lg font-bold text-white">
                G
              </div>
              <span className="text-xl font-bold text-white">
                Gudang<span className="gradient-text">Klip</span>
              </span>
            </Link>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">{t("Auth.loginTitle")}</h1>
          <p className="mb-8 text-[#a0a0c0]">
            {t("Auth.noAccount")}{" "}
            <Link href="/register" className="text-[#6c63ff] hover:underline">
              {t("Auth.signUpFree")}
            </Link>
          </p>

          {/* Google OAuth */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/creator" })}
            className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-[#2a2a50] bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t("Auth.loginWithGoogle")}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a50]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0a0a1a] px-2 text-[#a0a0c0]">{t("Auth.orLoginWithEmail")}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("Auth.email")}</label>
              <input
                {...register("email")}
                type="email"
                placeholder={t("Auth.emailPlaceholder")}
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

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? t("Common.loading") : (
                <>
                  <LogIn className="h-4 w-4" /> {t("Auth.loginTitle")}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}