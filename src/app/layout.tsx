import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toasts";
import RouteGuard from "@/components/RouteGuard";

// 🚀 OPTIMIZACIJA: display swap sprječava FOIT (Flash of Invisible Text)
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Ellevate - Rezervacije Grupnih Treninga",
    template: "%s | Ellevate"
  },
  description: "Ekskluzivni studio za treninge snage i oblikovanja tijela. Jednostavno upravljanje uslugama i rezervacijama.",
  keywords: ["trening", "fitness", "rezervacije", "snaga", "oblikovanje tijela"],
  openGraph: {
    title: "Ellevate Fitness Studio",
    description: "Ekskluzivni grupni treninzi dizajnirani za žene koje žele više. Snaga, energija, zajednica.",
    url: "https://www.ellevate.hr",
    siteName: "Ellevate",
    locale: "hr_HR",
    type: "website",
    images: [{ url: 'https://ellevate.hr/og-image.jpg', width: 1200, height: 630, alt: 'Ellevate Fitness Studio' }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ellevate Fitness Studio",
    description: "SaaS za jednostavno upravljanje rezervacijama treninga",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <body className={`${inter.className} min-h-screen gradient-bg`}>
        <AuthProvider>
          <ToastProvider>
            <RouteGuard>
              {children}
            </RouteGuard>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
