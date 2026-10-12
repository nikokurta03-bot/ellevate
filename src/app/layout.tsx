import WebVitals from '@/components/WebVitals';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toasts";
import RouteGuard from "@/components/RouteGuard";

// 🚀 OPTIMIZACIJA: display swap sprječava FOIT (Flash of Invisible Text)
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ellevate.hr"),
  title: {
    default: "Grupni treninzi za žene u Zadru | Ellevate",
    template: "%s | Ellevate"
  },
  description: "Grupni treninzi snage i oblikovanja tijela za žene u Zadru. Male grupe do 8 polaznica, podrška zajednice i jednostavna rezervacija termina.",
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
