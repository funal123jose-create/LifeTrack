import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-sans", // Cambiado para coincidir con tu globals.css
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono", // Cambiado para coincidir con tu globals.css
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeTrack Personal | Gestión de Progreso",
  description: "Plataforma para medir y mejorar el progreso en salud, carrera y crecimiento personal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}