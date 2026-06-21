"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
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
        toast.success("Registrasi berhasil! Silakan login.");
        router.push("/login");
      } else {
        const err = await res.json();
        toast.error(err.message || "Registrasi gagal");
      }
    } catch {
      toast.error("Terjadi kesalahan");
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
          <h2 className="mb-4 text-4xl font-bold text-white">Mulai Hasilkan Cuan!</h2>
          <p className="text-lg text-white/80">
            Daftar gratis, pilih role kamu, dan mulai perjalanan sebagai brand atau creator di GudangKlip.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: "\uD83D\uDE80", text: "Daftar gratis, gak perlu kartu kredit" },
            { icon: "\uD83C\uDFAF", text: "Pilih campaign yang sesuai dengan kamu" },
            { icon: "\uD83D\uDCB0", text: "Cuan masuk otomatis tiap views naik" },
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

          <h1 className="mb-2 text-2xl font-bold text-white">Daftar Gratis</h1>
          <p className="mb-8 text-[#8888aa]">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#6c63ff] hover:underline">Login</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#e8e8f0]">Saya adalah</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "CREATOR", label: "Creator", icon: "\uD83C\uDFAC" },
                  { value: "BRAND", label: "Brand", icon: "\uD83C\uDFE2" },
                  { value: "AGENCY", label: "Agency", icon: "\uD83C\uDF1F" },
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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">Nama Lengkap</label>
              <input
                {...register("name")}
                placeholder="Nama kamu"
                className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-3 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-3 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-3 pr-12 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">
                Kode Referral <span className="text-[#8888aa]">(opsional)</span>
              </label>
              <input
                {...register("referralCode")}
                placeholder="Masukkan kode referral"
                className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] px-4 py-3 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Loading..." : (
                <>
                  <UserPlus className="h-4 w-4" /> Daftar Gratis
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
