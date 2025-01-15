import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConnectkitProvider } from "./connectkit-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DexFlow",
  description: "DexFlow",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow">
              <ConnectkitProvider
                customTheme={{
                  "--ck-accent-color": "#00D54B",
                  "--ck-accent-text-color": "#ffffff",
                }}
              >
                {" "}
                <Header />
                {children}
              </ConnectkitProvider>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
