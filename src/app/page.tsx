"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import getAirdropOnClick from "../api/airdrop";
import AppButton from "./components/AppButton";
import DashboardIcon from "./components/icons/DashboardIcon";
import ContainerDiv from "./components/ContainerDiv"
import { LAMPORTS_PER_SOL, ParsedAccountData } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/table";
import { fetchTokenByAccount, fetchTokenDataById, fetchTokenList, fetchTokenPrice } from "@/api/token";

interface TokenBalance {
  parsedAccountInfo: ParsedAccountData;
  mintAddress: string;
  tokenBalance: number;
}

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { tokens, isLoading, isError } = fetchTokenList();
  const [balance, setBalance] = useState<number>(0);
  const [currencyValue, setCurrencyValue] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  useEffect(() => {
      if (publicKey) {
          (async function getBalanceEvery10Seconds() {
            const newBalance = await connection.getBalance(publicKey);
            setBalance(newBalance / LAMPORTS_PER_SOL);
          })();
          // (async function getAccountAssetsEvery10Seconds() {
          //   const tokenAccounts = await fetchTokenByAccount(publicKey, connection)
          //   setTokenBalances(tokenAccounts);
          // })();
      }
  }, [publicKey, connection]);

  useEffect(() => {
    if (isLoading || isError || !tokens || !publicKey) return;

    const processTokenAccounts = async () => {
      const tokenAccounts = await fetchTokenByAccount(publicKey, connection);

      const tokenDataPromises = tokenAccounts.map(async (token) => {
        const mintAddress = token.mintAddress;
        const tokenInfo = tokens[mintAddress];

        if (!tokenInfo) return null; // Skip if no token info available

        const { id } = tokenInfo;
        const tokenData = await fetchTokenDataById(id); // Fetch price using CoinGecko ID
        return {
          ...token,
          image: tokenData.data.image.small,
          symbol: tokenInfo.symbol,
          price: tokenData.data.market_data.current_price.usd
        };
      });

      const tokenData = await Promise.all(tokenDataPromises);
      setTokenBalances(tokenData.filter((data) => data !== null));
    };

    processTokenAccounts();
  }, [tokens, publicKey, connection]);

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

  const handleAirDrop = async (event: React.MouseEvent<HTMLButtonElement>) => {
    await getAirdropOnClick(connection, publicKey);
  }

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