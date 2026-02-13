import type { Metadata, Viewport } from "next";
import { Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Radar Tecnológico — Telecomunicaciones CEET | SENA",
  description:
    "Radar interactivo de vigilancia científico-tecnológica del área de telecomunicaciones del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET) — SENA 2025-2035.",
  keywords: [
    "radar tecnológico",
    "telecomunicaciones",
    "vigilancia tecnológica",
    "5G",
    "6G",
    "IA",
    "SENA",
    "CEET",
    "GICS",
  ],
  authors: [{ name: "Mauricio Alexander Vargas Rodríguez" }],
  icons: {
    icon: "/favicon/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Radar Tech",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${workSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
