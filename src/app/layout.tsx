import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocoClub",
  description: "A Investment Club for Everyone",
  openGraph: {
    title: "DocoClub",
    description: "A Investment Club for Everyone",
    images: [
      {
        url: "/og-image.png", // Make sure the image is named og-image.png in public/
        width: 1200,
        height: 630,
        alt: "DocoClub Open Graph Image",
      },
    ],
    type: "website",
    locale: "en_US",
    siteName: "DocoClub",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocoClub",
    description: "A Investment Club for Everyone",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          <div className="min-h-screen flex flex-col">
            <Header />
            {children}
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
