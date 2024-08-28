import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "./components/context/AppWalletProvider";
import Header from "./components/Header";
import AppThemeProvider from "./components/context/AppThemeProvider";

const inter = Inter({ subsets: ["latin"] });
// DM Sans', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
const dmSans = DM_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SolSets",
  description: "One-stop platform for handling your Solana assets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get System Theme
  const theme = "system";

  return (
    <html lang="en">
      <body className={dmSans.className}>
      <AppThemeProvider defaultTheme={theme} enableSystem>
        <AppWalletProvider>
          <Header />
          {children}
        </AppWalletProvider>
      </AppThemeProvider>
      </body>
    </html>
  );
}
