"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { campaignSchema, type CampaignInput } from "@/lib/validations";
import { CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createCampaign } from "@/actions/campaign.actions";

export default function NewCampaign() {
  const t = useTranslations("BrandCampaignNew");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      category: "BRAND",
      minViewsToClaim: 1000,
      cpmRate: 3000,
      totalBudget: 1000000,
    },
  });

  const onSubmit = async (data: CampaignInput) => {
    setSubmitting(true);
    try {
      await createCampaign(data);
      toast.success(t("toastSuccess"));
      router.push("/brand/campaigns");
    } catch (err: any) {
      toast.error(err.message || t("toastFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/brand/campaigns" className="flex items-center gap-2 text-sm text-[#a0a0c0] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div>
        <h2 className="text-2xl font-bold text-white">{t("title")}</h2>
        <p className="text-[#a0a0c0]">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{t("basicInfo")}</h3>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("campaignTitle")}</label>
            <input {...register("title")} placeholder={t("campaignTitlePlaceholder")} className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none" />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("category")}</label>
            <select {...register("category")} className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none">
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{t(`Category.${cat.value}` as any)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("description")}</label>
            <textarea {...register("description")} rows={3} placeholder={t("descriptionPlaceholder")} className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none" />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("brief")}</label>
            <textarea {...register("brief")} rows={4} placeholder={t("briefPlaceholder")} className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{t("budgetPayment")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("totalBudget")}</label>
              <input {...register("totalBudget", { valueAsNumber: true })} type="number" placeholder={t("totalBudgetPlaceholder")} className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none" />
              {errors.totalBudget && <p className="mt-1 text-xs text-red-400">{errors.totalBudget.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("cpmRate")}</label>
              <input {...register("cpmRate", { valueAsNumber: true })} type="number" placeholder={t("cpmRatePlaceholder")} className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none" />
              {errors.cpmRate && <p className="mt-1 text-xs text-red-400">{errors.cpmRate.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("minViewsToClaim")}</label>
              <input {...register("minViewsToClaim", { valueAsNumber: true })} type="number" placeholder="1000" className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("maxViewsPerVideo")}</label>
              <input {...register("maxViewsPerVideo", { valueAsNumber: true })} type="number" placeholder={t("maxViewsPlaceholder")} className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white placeholder:text-[#a0a0c0] focus:border-[#6c63ff] focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{t("campaignPeriod")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("startDate")}</label>
              <input {...register("startDate")} type="date" className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none" />
              {errors.startDate && <p className="mt-1 text-xs text-red-400">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#e8e8f0]">{t("endDate")}</label>
              <input {...register("endDate")} type="date" className="w-full rounded-xl border border-[#2a2a50] bg-[#0d0d22] px-4 py-3 text-sm text-white focus:border-[#6c63ff] focus:outline-none" />
              {errors.endDate && <p className="mt-1 text-xs text-red-400">{errors.endDate.message}</p>}
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? t("creating") : t("createButton")}
        </button>
      </form>
    </div>
  );
}
