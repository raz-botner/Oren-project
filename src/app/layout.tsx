import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientSideProviders from "./providers"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Photo Labeler OCR",
  description: "Identify addresses from yellow stickers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSideProviders>
          {children}
        </ClientSideProviders>
      </body>
    </html>
  );
}