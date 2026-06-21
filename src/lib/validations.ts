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
  companyName: z.string().min(2, "Nama perusahaan minimal 2 karakter").max(200).optional(),
  industry: z.enum(["E_COMMERCE", "FOOD_BEVERAGE", "FASHION_BEAUTY", "TECHNOLOGY", "FINANCE", "HEALTH_WELLNESS", "ENTERTAINMENT", "EDUCATION", "TRAVEL_HOSPITALITY", "OTHER"]).optional(),
  referralCode: z.string().max(50, "Referral code maksimal 50 karakter").regex(/^[A-Z0-9]*$/, "Referral code hanya boleh huruf kapital dan angka").optional(),
});

export const campaignSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(200, "Judul maksimal 200 karakter"),
  description: z.string().min(20, "Deskripsi minimal 20 karakter").max(5000, "Deskripsi maksimal 5000 karakter"),
  brief: z.string().max(2000, "Brief maksimal 2000 karakter").optional(),
  category: z.enum(["MUSIC", "FILM", "BRAND", "ENTERTAINMENT"]),
  totalBudget: z.number().min(100000, "Budget minimal Rp 100.000").max(1000000000, "Budget maksimal Rp 1.000.000.000"),
  cpmRate: z.number().min(100, "CPM minimal Rp 100").max(10000000, "CPM maksimal Rp 10.000.000"),
  minViewsToClaim: z.number().min(100, "Minimal 100 views"),
  maxViewsPerVideo: z.number().max(100000000, "Max views per video terlalu besar").optional(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
});

export const submissionSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID wajib diisi"),
  videoUrl: z.string().url("URL video tidak valid").optional(),
  platformLink: z.string().url("Link platform tidak valid").optional(),
  platform: z.enum(["TIKTOK", "INSTAGRAM", "YOUTUBE"]).optional(),
}).refine(
  (data) => data.videoUrl || data.platformLink,
  { message: "Minimal salah satu: video URL atau platform link wajib diisi", path: ["videoUrl"] }
);

export const payoutSchema = z.object({
  amount: z.number().min(50000, "Minimal penarikan Rp 50.000").max(100000000, "Maksimal penarikan Rp 100.000.000"),
  payoutMethod: z.enum(["BANK", "GOPAY", "OVO", "DANA"]),
  accountInfo: z.string().min(3, "Info akun wajib diisi").max(200, "Info akun maksimal 200 karakter"),
});

export const connectSocialSchema = z.object({
  platform: z.enum(["TIKTOK", "INSTAGRAM", "YOUTUBE"]),
  username: z.string().min(2, "Username wajib diisi").max(100, "Username maksimal 100 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type PayoutInput = z.infer<typeof payoutSchema>;
