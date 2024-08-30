"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import getAirdropOnClick from "../api/airdrop";
import AppButton from "./components/AppButton";
import DashboardIcon from "./components/icons/DashboardIcon";
import ContainerDiv from "./components/ContainerDiv"
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/table";
import { fetchTokenPrice } from "@/api/token";
import {TOKEN_PROGRAM_ID} from '@solana/spl-token'

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const handleAirDrop = async (event: React.MouseEvent<HTMLButtonElement>) => {
    await getAirdropOnClick(connection, publicKey);
  }
  const [balance, setBalance] = useState<number>(0);
  const [currencyValue, setCurrencyValue] = useState<number>(0);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
      if (publicKey) {
          (async function getBalanceEvery10Seconds() {
            const newBalance = await connection.getBalance(publicKey);
            setBalance(newBalance / LAMPORTS_PER_SOL);
            setTimeout(getBalanceEvery10Seconds, 10000);
          })();
          // (async function getAccountAssetsEvery10Seconds() {
          //   const tokenList = await connection.getTokenLargestAccounts(publicKey);
          //   setTimeout(getAccountAssetsEvery10Seconds, 10000);
          //   console.log(tokenList);
          // })
      }
  }, [publicKey, connection]);

  async function getAccountAssetsEvery10Seconds() {
    if (publicKey) {
      const tokenList = await connection.getTokenAccountsByOwner(publicKey, {programId: TOKEN_PROGRAM_ID});
      setTimeout(getAccountAssetsEvery10Seconds, 10000);
      console.log(tokenList);
    }
  }

  getAccountAssetsEvery10Seconds();

  useEffect(() => {
    const fetchSolPrice = async () => {
      await fetchTokenPrice("solana").then((response) => {
        let value = 0;
        if (response) {
          const { solana } = response.data
          const solToUsdRate = solana.usd;
          value = balance * solToUsdRate;
        }
        setCurrencyValue(value);
      });
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
          <h1 className="lg:text-5xl text-4xl">${currencyValue.toFixed(2)} USD</h1>
          <h1 className="lg:text-3xl text-2xl">{balance}</h1>
        </ContainerDiv>
        <ContainerDiv>
          Hello
        </ContainerDiv>
      </div>
      <Table 
            className="lg:my-4 my-2" 
            aria-label="Account Assets"
      >
        <TableHeader>
            <TableColumn>ASSET</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
            <TableColumn>VALUE</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No assets found"}>
          {[]}
        </TableBody>
      </Table>
      <AppButton onClick={handleAirDrop}>AirDrop</AppButton>
    </div>
  );
}