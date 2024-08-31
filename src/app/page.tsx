"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import getAirdropOnClick from "../api/airdrop";
import AppButton from "./components/AppButton";
import DashboardIcon from "./components/icons/DashboardIcon";
import ContainerDiv from "./components/ContainerDiv"
import { LAMPORTS_PER_SOL, ParsedAccountData } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/table";
import { fetchTokenByAccount, fetchTokenPrice } from "@/api/token";
import Image from "next/image";
import axios from "axios";
import useSWR from "swr";

interface TokenBalance {
  parsedAccountInfo: ParsedAccountData;
  mintAddress: string;
  tokenBalance: number;
  image: string,
  symbol: string,
  price: number
}

interface TokenList {
  id: string;
  symbol: string;
  name: string;
}

interface TokenListMapping {
  [key: string]: TokenList;
}

// SWR fetcher function
const fetcher = (url: string) => axios.get(url).then(res => res.data);

// Custom hook to fetch token data by ID
export const fetchTokenDataById = (tokenId: string) => {
  const { data, error } = useSWR(`https://api.coingecko.com/api/v3/coins/${tokenId}`, fetcher, {
    refreshInterval: 3600000, // Refresh every 1 hour
    revalidateOnFocus: false, // Prevent revalidation when window gains focus
  });

  return {
    data,
    isLoading: !error && !data,
    isError: error
  };
};

// Fetch token list
export const fetchTokenList = () => {
  const { data, error } = useSWR('https://api.coingecko.com/api/v3/coins/list', fetcher, {
    refreshInterval: 3600000, // Refresh every 1 hour
    revalidateOnFocus: false, // Prevent revalidation when window gains focus
  });

  if (error) return { tokens: {}, isLoading: false, isError: true };
  if (!data) return { tokens: {}, isLoading: true, isError: false };

  // Filter tokens to only those that have Solana platforms
  const solanaTokens: TokenListMapping = {};
  for (const token of data) {
    if (token.platforms && token.platforms.solana) {
      const mint: string = token.platforms.solana;
      solanaTokens[mint] = {
        id: token.id,
        symbol: token.symbol,
        name: token.name,
      };  
    }
  }

  return { tokens: solanaTokens, isLoading: false, isError: false };
};

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
            setTimeout(getBalanceEvery10Seconds, 10000);
          })();
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
        const tokenData = fetchTokenDataById(id); // Fetch price using CoinGecko ID
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
      let totalValue = 0;
      await fetchTokenPrice("solana").then((response) => {
        if (response) {
          const { solana } = response.data
          const solToUsdRate = solana.usd;
          totalValue = balance * solToUsdRate;
        }
        tokenBalances.forEach(token => {
          if (token.price) {
            totalValue += token.tokenBalance * token.price;
          }
        });
  
        setCurrencyValue(totalValue);
      });
    }
    if (balance > 0) {
      fetchSolPrice();
    }
  }, [balance, tokenBalances]);

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
          {tokenBalances.map((token, index) => {
            return (
              <TableRow key={index}>
                <TableCell>
                  <Image 
                    src={token.image}
                    className="w-2 h-auto"
                    width={undefined}
                    height={undefined}
                    alt={token.symbol}
                  />
                  {token.symbol}
                </TableCell>
                <TableCell>
                  {token.tokenBalance}
                </TableCell>
                <TableCell>
                  ${token.price} USD
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <AppButton onClick={handleAirDrop}>AirDrop</AppButton>
    </div>
  );
}