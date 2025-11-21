import type { Metadata } from "next";
import { Poppins, Mukta } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/app/theme-provider";

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "700"],
  variable: "--font-mukta",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Rajasthan AI Scholar",
  description: "कक्षा 12 के छात्रों के लिए एआई-संचालित शिक्षण मंच।",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body
        className={`${mukta.variable} ${poppins.variable} font-body antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
