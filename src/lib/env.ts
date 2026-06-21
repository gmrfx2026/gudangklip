import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET minimal 16 karakter"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL harus URL valid"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL harus URL valid"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID wajib diisi"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET wajib diisi"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY wajib diisi"),
  MIDTRANS_SERVER_KEY: z.string().min(1, "MIDTRANS_SERVER_KEY wajib diisi"),
  MIDTRANS_CLIENT_KEY: z.string().min(1, "MIDTRANS_CLIENT_KEY wajib diisi"),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z.enum(["true", "false"]).optional().default("false"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(
      `❌ Environment variable validation gagal:\n${missing.join("\n")}\n\n` +
        `Pastikan semua variable di .env.local sudah diisi dengan benar.`
    );
  }

  return result.data;
}

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}
