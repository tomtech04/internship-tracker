import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { getAllCompaniesBasic } from "@/lib/queries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Internship Tracker",
  description: "Track internship applications, referrals, and interviews.",
};

// Every page here reads the local SQLite database, and the data changes
// constantly — there's nothing to statically prerender. Forcing dynamic
// rendering app-wide also means `next build` never needs a live database.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const companies = await getAllCompaniesBasic();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppShell companies={companies}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
