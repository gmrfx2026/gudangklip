import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "id" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#111128",
                color: "#e8e8f0",
                border: "1px solid #2a2a50",
              },
            }}
          />
        </ThemeProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
