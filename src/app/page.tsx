"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import getAirdropOnClick from "../api/airdrop";
import AppButton from "./components/AppButton";
import DashboardIcon from "./components/icons/DashboardIcon";
import ContainerDiv from "./components/ContainerDiv"
import { ParsedAccountData } from "@solana/web3.js";
import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/table";
import { fetchAssociatedAccountByMintAddress, fetchTokenByAccount, fetchTokenDataByIds, fetchTokenList } from "@/api/token";
import Image from "next/image";
import getWalletBalance from "@/api/wallet";

interface TokenBalance {
  parsedAccountInfo: ParsedAccountData;
  mintAddress: string;
  tokenBalance: number;
  image?: string,
  symbol: string,
  price: number
}

export const Home = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { tokens, isLoading: tokensLoading, isError: tokensError } = fetchTokenList();
  const [balance, setBalance] = useState<number>(0);
  const [currencyValue, setCurrencyValue] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  // Memoized tokens
  const memoizedTokens = useMemo(() => tokens, [tokensLoading, tokensError]);
  // Fetch token data by IDs, including Solana
  const tokenIds = useMemo(() => {
    if (memoizedTokens) {
      let ids = Object.values(memoizedTokens).map(token => token.id).filter(id => id);
      ids.push('solana'); // Add Solana's ID
      return ids;
    }
    return ['solana']; // Ensure 'solana' is included even if there are no other tokens
  }, [memoizedTokens]);

  const { data: fetchedTokenData } = fetchTokenDataByIds(tokenIds, 'usd');

  useEffect(() => {
    if (!publicKey || !connection || tokensLoading || tokensError || !memoizedTokens || !fetchedTokenData) return;

    // Function to fetch the wallet balance in Solana
    const fetchBalance = async () => {
      const newBalance = await getWalletBalance(connection, publicKey);
      setBalance(newBalance);
    };

    // Processing token accounts
    const processTokenAccounts = async () => {
      const tokenAccounts = await fetchTokenByAccount(publicKey, connection);
      // Temporary total value variable to calculate total value
      let tempTotalValue = 0;

      // Process tokens
      const tokenData = tokenAccounts.map((token) => {
        const mintAddress = token.mintAddress;
        const tokenInfo = memoizedTokens[mintAddress];
        if (!tokenInfo) return null;

        // Find token data from the fetched data list
        const tokenData = fetchedTokenData?.find((td) => td.id === tokenInfo.id);
        if (tokenData && tokenData.current_price) {
          tempTotalValue += (tokenData.current_price * token.tokenBalance);
        }

        return {
          ...token,
          image: tokenData?.image,
          symbol: tokenInfo.symbol,
          price: tokenData?.current_price || 0,
        };
      }).filter((data) => data !== null);

      // Process Solana's value and add it to the token balances
      const solanaData = fetchedTokenData?.find(td => td.id === 'solana');
      if (solanaData && solanaData.current_price) {
        tempTotalValue += (solanaData.current_price * balance);
        const solanaTokenBalance = {
          parsedAccountInfo: {
            program: "",
            parsed: undefined,
            space: 0
          }, // Solana native balance might not have parsed account info like SPL tokens
          mintAddress: 'solana', // Placeholder identifier (Won't be using it)
          tokenBalance: balance,
          image: solanaData.image,
          symbol: solanaData.symbol,
          price: solanaData.current_price,
        };
        tokenData.push(solanaTokenBalance); // Add Solana's data to token balances
      }

      setTokenBalances(tokenData);
      setCurrencyValue(tempTotalValue); // Set the total value of tokens
    };

    fetchBalance();
    processTokenAccounts();
  }, [publicKey, connection, memoizedTokens, fetchedTokenData, balance]);

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
          <h1 className="text-center lg:text-5xl text-4xl">${currencyValue.toFixed(2)} USD</h1>
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
        <TableBody emptyContent={"No assets found"} items={tokenBalances}>
          {tokenBalances.map((token, index) => {
            return (
              <TableRow key={index}>
                <TableCell className="flex flex-row gap-2 items-center">
                {token.image &&                   
                  <Image
                    aria-label={token.symbol}
                    src={token.image}
                    className="w-4 h-auto"
                    width={50}
                    height={50}
                    alt={token.symbol}
                />}
                <span className="uppercase">
                  {token.symbol}
                </span>
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

export default Home