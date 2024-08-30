"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import getAirdropOnClick from "../api/airdrop";
import AppButton from "./components/AppButton";
import DashboardIcon from "./components/icons/DashboardIcon";
import ContainerDiv from "./components/ContainerDiv"
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const handleAirDrop = async (event: React.MouseEvent<HTMLButtonElement>) => {
    await getAirdropOnClick(connection, publicKey);
  }
  const [balance, setBalance] = useState<number>(0);
  const [currencyValue, setCurrencyValue] = useState<number>(0);

  useEffect(() => {
      if (publicKey) {
          (async function getBalanceEvery10Seconds() {
              const newBalance = await connection.getBalance(publicKey);
              setBalance(newBalance / LAMPORTS_PER_SOL);
              setTimeout(getBalanceEvery10Seconds, 10000);
          })();
      }
  }, [publicKey, connection]);

  useEffect(() => {
    const fetchSolPrice = async () => {
      await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      ).then((response) => {
        const { solana } = response.data
        const solToUsdRate = solana.usd;
        setCurrencyValue(balance * solToUsdRate);
      }).catch((err) => {
        console.error("Failed to fetch SOL price:", err);

      })
    }
    if (balance > 0) {
      fetchSolPrice();
    }
  }, [balance]);

  return (
    <div className="w-screen p-5">
      <div className="flex items-center gap-4">
          <DashboardIcon className="w-8 h-auto"/>
          <h1 className="lg:text-2xl text-xl font-bold">Dashboard</h1>
      </div>
      <div className="lg:grid lg:grid-cols-2 flex flex-col gap-10 lg:my-4 my-2">
        <ContainerDiv>
          <h4 className="text-gray-400">Net Worth</h4>
          <h1 className="lg:text-5xl text-4xl">{balance}</h1>
          <h1 className="lg:text-3xl text-2xl">{currencyValue.toFixed(2)} USD</h1>
        </ContainerDiv>
        <ContainerDiv>
          Hello
        </ContainerDiv>
      </div>
      <AppButton onClick={handleAirDrop}>AirDrop</AppButton>
    </div>
  );
}