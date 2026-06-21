import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "GudangKlip - Marketplace Clipping Indonesia",
  description:
    "Platform marketplace clipping yang menghubungkan brand dengan content creator. Brand buat campaign, creator bikin clip, posting di sosmed, cuan ngalir tiap views naik.",
  keywords: ["clipping", "marketplace", "creator", "brand", "iklan", "indonesia"],
};

const midtransSnapUrl = process.env.MIDTRANS_IS_PRODUCTION === "true"
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} font-sans`}>
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
        <Script
          src={midtransSnapUrl}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
