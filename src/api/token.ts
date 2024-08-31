import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, GetProgramAccountsFilter, ParsedAccountData, PublicKey } from "@solana/web3.js";
import axios, { AxiosResponse } from "axios";
import useSWR from "swr";

// SWR fetcher function
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface TokenList {
  id: string;
  symbol: string;
  name: string;
}

interface TokenListMapping {
  [key: string]: TokenList;
}

// Fetch token list
export const fetchTokenList = () => {
  const { data, error } = useSWR('https://api.coingecko.com/api/v3/coins/list?include_platform=true', fetcher, {
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

export const fetchTokenDataById = (tokenId: string) => {
  const { data, error } = useSWR(`https://api.coingecko.com/api/v3/coins/${tokenId}`, fetcher, {
    refreshInterval: 3600000, // Refresh every 1 hour
    revalidateOnFocus: false, // Prevent revalidation when window gains focus
  })

  if (error) return { data: [], isLoading: false, isError: true };
  if (!data) return { data: [], isLoading: true, isError: false };

  return { data, isLoading: true, isError: false }

}

export const fetchTokenPrice = async (token: string) => {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
    )
    .catch((err) => {
      console.error(`Failed to fetch ${token} price:`, err);
    })
    return response
  }

export const fetchTokenByAccount = async (publicKey: PublicKey, connection: Connection) => {
    const filters:GetProgramAccountsFilter[] = [
        {
          dataSize: 165,
        },
        {
          memcmp: {
            offset: 32,
            bytes: publicKey.toBase58(),
          },            
        }];
    const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {filters: filters}
    );
    console.log(`Found ${accounts.length} token account(s) for wallet ${publicKey}.`);
    const tokenAccounts = accounts.map((account, i) => {
        //Parse the account data
        const parsedAccountInfo: ParsedAccountData = account.account.data as ParsedAccountData;
        const mintAddress:string = parsedAccountInfo.parsed.info.mint;
        const tokenBalance:number = parsedAccountInfo.parsed.info.tokenAmount.uiAmount;

        return {
          parsedAccountInfo,
          mintAddress,
          tokenBalance
        }
    });
    return tokenAccounts
}