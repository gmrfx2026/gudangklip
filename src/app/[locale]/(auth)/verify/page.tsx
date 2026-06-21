"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

function VerifyContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState(t("Auth.verifyChecking"));

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("Auth.verifyTokenNotFound"));
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || t("Auth.verifySuccessMsg"));
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.message || t("Auth.verifyFailedMsg"));
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage(t("Auth.verifyNetworkError"));
      });
  }, [token, router, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a]">
      <div className="w-full max-w-md rounded-3xl border border-[#2a2a50] bg-[#111128] p-8 text-center">
        {status === "loading" ? (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#6c63ff]" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">{t("Auth.verifyTitle")}</h1>
            <p className="text-[#8888aa]">{message}</p>
          </>
        ) : status === "success" ? (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#10b981]/10">
              <CheckCircle className="h-10 w-10 text-[#10b981]" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">{t("Auth.verifySuccess")}</h1>
            <p className="mb-8 text-[#8888aa]">{message}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              {t("Auth.backToLogin")}
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#ef4444]/10">
              <XCircle className="h-10 w-10 text-[#ef4444]" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">{t("Auth.verifyFailed")}</h1>
            <p className="mb-8 text-[#8888aa]">{message}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#3b82f6] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              {t("Auth.backToLogin")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a]">
        <Loader2 className="h-10 w-10 animate-spin text-[#6c63ff]" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}