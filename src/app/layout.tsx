import WebVitals from '@/components/WebVitals';
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
  },
  twitter: {
    card: "summary",
    title: "Ellevate Fitness Studio",
    description: "Ellevate Fitness Studio — grupni treninzi za žene u Zadru",
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
        <a href="#main-content" className="skip-to-content">Preskoči na sadržaj</a>
        <WebVitals />
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
