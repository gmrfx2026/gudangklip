import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["BRAND", "CREATOR", "AGENCY"]),
  referralCode: z.string().optional(),
});

export const campaignSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  brief: z.string().optional(),
  category: z.enum(["MUSIC", "FILM", "BRAND", "ENTERTAINMENT"]),
  totalBudget: z.number().min(100000, "Budget minimal Rp 100.000"),
  cpmRate: z.number().min(100, "CPM minimal Rp 100"),
  minViewsToClaim: z.number().min(100, "Minimal 100 views"),
  maxViewsPerVideo: z.number().optional(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
});

export const submissionSchema = z.object({
  campaignId: z.string().min(1),
  videoUrl: z.string().url("URL video tidak valid").optional(),
  platformLink: z.string().url("Link platform tidak valid").optional(),
  platform: z.enum(["TIKTOK", "INSTAGRAM", "YOUTUBE"]).optional(),
});

export const payoutSchema = z.object({
  amount: z.number().min(50000, "Minimal penarikan Rp 50.000"),
  payoutMethod: z.enum(["BANK", "GOPAY", "OVO", "DANA"]),
  accountInfo: z.string().min(3, "Info akun wajib diisi"),
});

export const connectSocialSchema = z.object({
  platform: z.enum(["TIKTOK", "INSTAGRAM", "YOUTUBE"]),
  username: z.string().min(2, "Username wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type PayoutInput = z.infer<typeof payoutSchema>;
