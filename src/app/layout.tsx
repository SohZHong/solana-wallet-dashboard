import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "./components/context/AppWalletProvider";
import Header from "./components/Header";
import AppThemeProvider from "./components/context/AppThemeProvider";
import AppMotionProvider from "./components/context/AppMotionProvider";
import ConnectNotice from "./components/ConnectNotice";
import AppConnectionHandler from "./components/context/AppConnectionHandler";

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
      <body 
        className={`${dmSans.className} h-screen overflow-x-hidden dark:text-white text-black dark:bg-black bg-white-mode`}
      >
      <AppThemeProvider attribute="class" defaultTheme={theme} enableSystem>
          <AppWalletProvider>
              <Header />
              <AppMotionProvider mode="wait">
                <AppConnectionHandler>
                  {children}
                </AppConnectionHandler>
              </AppMotionProvider>
          </AppWalletProvider>
      </AppThemeProvider>
      </body>
    </html>
  );
}
