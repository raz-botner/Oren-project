import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import ClientSideProviders from "./providers"; 

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#1976d2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Photo Labeler OCR",
  description: "Identify addresses from yellow stickers",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Photo Labeler",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <ClientSideProviders>
          {children}
        </ClientSideProviders>
      </body>
    </html>
  );
}