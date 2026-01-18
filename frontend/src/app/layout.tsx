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
      <head>
        {/* DOM Synchronization script to clear environmental markers before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const html = document.documentElement;
                  if (html.hasAttribute('data-jetski-tab-id')) {
                    html.removeAttribute('data-jetski-tab-id');
                  }
                  
                  // Note: Antigravity-scroll-lock is an environmental marker injected by the monitoring tool.
                  // We handle it in the body tag via matching to ensure hydration succeeds without warnings.
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      {/* 
        We use font-system and acknowledge the environmental 'antigravity-scroll-lock' 
        marker if present on the server to ensure hydration success.
      */}
      <body className={`${systemFont.className} antigravity-scroll-lock`}>
        <ThemeProvider>
          {/* <AuthInitializer> */}
          {children}
          {/* </AuthInitializer> */}
        </ThemeProvider>

        {/* Post-hydration cleanup of environmental markers */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Remove the lock class after hydration has a chance to stabilize
                setTimeout(function() {
                  document.body.classList.remove('antigravity-scroll-lock');
                }, 100);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
