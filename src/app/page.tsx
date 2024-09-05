"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import getAirdropOnClick from "../api/airdrop";
import AppButton from "./components/AppButton";
import DashboardIcon from "./components/icons/DashboardIcon";
import ContainerDiv from "./components/ContainerDiv"
import { ParsedAccountData } from "@solana/web3.js";
import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/table";
import { fetchAssociatedAccountByMintAddress, fetcher, fetchTokenByAccount, useTokenDataByIds, useTokenDataWithAddress, } from "@/api/token";
import Image from "next/image";
import getWalletBalance from "@/api/wallet";
import useSWR from "swr";

interface TokenBalance {
  mintAddress: string;
  tokenBalance: number;
  image?: string,
  symbol?: string,
  price?: number
}

export const Home = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  
  const [contractAddresses, setContractAddresses] = useState<string[]>([]);
  const [tokenAccounts, setTokenAccounts] = useState<TokenBalance[]>([]);
  const [solanaBalance, setSolanaBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('usd'); // Default to 'usd'
  const [currencyValue, setCurrencyValue] = useState<number>(0);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('devnet');

  useEffect(() => {
    // Read currency, network from localStorage
    const currency = localStorage.getItem('currency');
    const network = localStorage.getItem('selectedNetwork');
    setCurrency(currency ? currency : 'usd');
    setSelectedNetwork(network ? network : 'devnet');
  }, []);

  // Fetch token accounts and Solana balance on load
  useEffect(() => {
    const fetchBalanceAndTokens = async () => {
      if (!publicKey || !connection) return;

      // Fetch Solana balance
      const newBalance = await getWalletBalance(connection, publicKey);
      setSolanaBalance(newBalance);

      // Fetch token accounts
      const fetchedTokenAccounts = await fetchTokenByAccount(publicKey, connection);
      const addresses = fetchedTokenAccounts.map((token) => token.mintAddress);
      setContractAddresses(addresses);
      setTokenAccounts(fetchedTokenAccounts);
    };
    fetchBalanceAndTokens();
  }, [publicKey, connection]);

  const { token: tokens, isLoading: isTokenLoading, isError: isTokenError } = useTokenDataWithAddress(contractAddresses);
  const { data: solanaData, isLoading: isSolLoading, isError: isSolError } = useTokenDataByIds(['solana'], currency);

  useEffect(() => {
  
    if (isTokenLoading || isTokenError || isSolLoading || isSolError) return;
  
    let tempTotalValue = 0;
    const updatedTokenAccounts: TokenBalance[] = tokenAccounts.map((account) => {
      // Find the corresponding token data by mintAddress
      const tokenData = tokens.find((token) => token.platforms.solana === account.mintAddress);
  
      if (tokenData) {
        const currentPrice = tokenData.market_data.current_price[currency];
        tempTotalValue += currentPrice * account.tokenBalance;
  
        return {
          ...account,
          image: tokenData.image?.large,
          symbol: tokenData.symbol.toUpperCase(),
          price: currentPrice,
        };
      }
  
      // If no tokenData is found, return the account unchanged
      return account;
    });

  // Add Solana balance
  if (solanaData && solanaData[0].current_price) {
    const solData = solanaData[0];
    const solanaPrice = solData.current_price;
    tempTotalValue += solanaPrice * solanaBalance;
    updatedTokenAccounts.push({
      mintAddress: 'solana',
      image: solData.image,
      symbol: solData.symbol,
      price: solanaPrice,
      tokenBalance: solanaBalance
    });
  }

  setTokenAccounts(updatedTokenAccounts);
  setCurrencyValue(tempTotalValue);
}, [tokens, solanaData, currency]);

  const handleAirDrop = async (event: React.MouseEvent<HTMLButtonElement>) => {
    await getAirdropOnClick(connection, publicKey);
  }

  return (
    <div className="w-screen p-5">
      <div className="flex items-center gap-4">
          <DashboardIcon className="w-8 h-auto"/>
          <h1 className="lg:text-2xl text-xl font-bold">Dashboard</h1>
      </div>
      <div className="lg:my-4 my-2">
        <ContainerDiv>
          <h4 className="text-gray-400">Net Worth</h4>
          <h1 className="text-center lg:text-5xl text-4xl">${currencyValue.toFixed(2)} {currency.toUpperCase()}</h1>
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
        <TableBody emptyContent={"No assets found"} items={tokenAccounts}>
          {tokenAccounts.map((token, index) => {
            return (
              <TableRow key={index}>
                <TableCell className="flex flex-row gap-2 items-center">
                {token?.image &&                   
                  <Image
                    aria-label={token.symbol}
                    src={token.image}
                    className="w-4 h-auto"
                    width={50}
                    height={50}
                    alt={token.symbol ? token.symbol : 'Token img'}
                />}
                <span className="uppercase">
                  {token?.symbol}
                </span>
                </TableCell>
                <TableCell>
                  {token?.tokenBalance}
                </TableCell>
                <TableCell>
                  ${token?.price} {currency.toUpperCase()}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {
        selectedNetwork === 'devnet' &&
        <AppButton onClick={handleAirDrop}>AirDrop Dev Tokens</AppButton>
      }
    </div>
  );
}

export default Home