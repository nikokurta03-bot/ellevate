import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";

// 🚀 OPTIMIZACIJA: display swap sprječava FOIT (Flash of Invisible Text)
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Ellevate - Rezervacije Grupnih Treninga",
  description: "SaaS za jednostavno upravljanje rezervacijama treninga",
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
          <RouteGuard>
            {children}
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
