"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import getAirdropOnClick from "./api/airdrop";
import WalletBalance from "./components/WalletBalance";
import AppButton from "./components/AppButton";

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const handleAirDrop = async (event: React.MouseEvent<HTMLButtonElement>) => {
    await getAirdropOnClick(connection, publicKey);
  }

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="font-bold">
        <WalletBalance />
        <AppButton onClick={handleAirDrop}>AirDrop</AppButton>
      </div>
    </main>
  );
}