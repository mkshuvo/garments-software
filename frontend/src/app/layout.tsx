import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

// Use system fonts to avoid Google Fonts network dependency during Docker build
// This prevents build failures due to network timeouts
const systemFont = {
  variable: "--font-inter",
  className: "font-system",
};

// Alternative: If you want to use Google Fonts in production, 
// you can conditionally load it based on environment
// const inter = process.env.NODE_ENV === 'production' ? 
//   Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" }) : 
//   systemFont;

export const metadata: Metadata = {
  title: "GarmentsERP - Garment Management System",
  description: "Complete ERP solution for garment manufacturing and retail business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={systemFont.className}>
        <ThemeProvider>
          {/* <AuthInitializer> */}
            {children}
          {/* </AuthInitializer> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
