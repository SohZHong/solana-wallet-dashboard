import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, GetProgramAccountsFilter, ParsedAccountData, PublicKey } from "@solana/web3.js";
import axios from "axios";
import useSWR from "swr";

// SWR fetcher function
export const fetcher = (url: string) => axios.get(url).then(res => res.data);

const multiFetcher = (urls: string[]) => Promise.all(
  urls.map(url => axios.get(url).then(res => res.data)
))

// export interface TokenList {
//   id: string;
//   symbol: string;
//   name: string;
//   token: any;
//   image?: string,
//   current_price?: number
// }

// interface TokenListMapping {
//   [key: string]: TokenList;
// }

export const fetchTokenPrice = (contractAddress: string, currency: string) => {
  const { data, error } = useSWR(
    `https://api.coingecko.com/api/v3/simple/token_price/id?contract_addresses=${contractAddress}&vs_currencies=${currency}'`,
    fetcher,
    {
      refreshInterval: 3600000, // Refresh every 1 hour
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useTokenDataWithAddress = (contractAddresses: string[]) => {
  // Only fetch if there are contract addresses available
  const shouldFetch = contractAddresses && contractAddresses.length > 0;
  
  const { data, error } = useSWR(
    shouldFetch
      ? contractAddresses.map(address => `https://api.coingecko.com/api/v3/coins/solana/contract/${address}`)
      : null,  // Return null to prevent SWR from fetching
    multiFetcher,
    {
      refreshInterval: 3600000, // Refresh every hour
      revalidateOnFocus: false, // Prevent revalidation when window gains focus
      dedupingInterval: 300000, // SWR deduping interval, 5 minutes
    }
  );

  // Handle loading and error states
  return {
    token: data || [],
    isLoading: !error && !data,
    isError: error,
  };
};

// 

// Fetch token list
// export const fetchTokenList = () => {
//   const { data, error } = useSWR('https://api.coingecko.com/api/v3/coins/list?include_platform=true', fetcher, {
//     refreshInterval: 3600000, // Refresh every 1 hour
//     revalidateOnFocus: false, // Prevent revalidation when window gains focus
//     dedupingInterval: 300000, // SWR deduping interval, 5 minutes
//   });

//   if (error) return { tokens: {}, isLoading: false, isError: true };
//   if (!data) return { tokens: {}, isLoading: true, isError: false };

//   // Filter tokens to only those that have Solana platforms
//   const solanaTokens: TokenListMapping = {};
//   for (const token of data) {
//     if (token.platforms && token.platforms.solana) {
//       const mint: string = token.platforms.solana;
//       solanaTokens[mint] = {
//         id: token.id,
//         symbol: token.symbol,
//         name: token.name,
//       };  
//     }
//   }
//   return { tokens: solanaTokens, isLoading: false, isError: false };
// };

// Custom hook to fetch token data by ID
export const useTokenDataByIds = (tokenIds: string[], currency: string)=> {
  let queryString = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=`
  // Concatenating ids to query string
  queryString += (tokenIds.length > 1 ? tokenIds.join(',') : tokenIds[0]);
  const { data, error } = useSWR((queryString),
    fetcher, {
    refreshInterval: 3600000, // Refresh every 1 hour
    revalidateOnFocus: false, // Prevent revalidation when window gains focus
    dedupingInterval: 300000, // SWR deduping interval, 5 minutes
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Retry only a few times
      if (retryCount >= 3) return;
      // Retry after 1 second if error
      setTimeout(() => revalidate({ retryCount }), 1000);
    },
  });

  return {
    data,
    isLoading: !error && !data,
    isError: error
  };
};

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
    const tokenAccounts = accounts.map((account) => {
        //Parse the account data
        const parsedAccountInfo: ParsedAccountData = account.account.data as ParsedAccountData;
        const mintAddress:string = parsedAccountInfo.parsed.info.mint;
        const tokenBalance:number = parsedAccountInfo.parsed.info.tokenAmount.uiAmount;

        return {
          mintAddress,
          tokenBalance
        }
    });
    return tokenAccounts
}

export const fetchAssociatedAccountByMintAddress = async (publicKey: PublicKey, connection: Connection): Promise<PublicKey[]> => {
  const tokenAccounts = await fetchTokenByAccount(publicKey, connection);
  const associatedAccounts = tokenAccounts.map(account => {
    return getAssociatedTokenAddressSync(new PublicKey(account.mintAddress), publicKey);
  })
  return associatedAccounts;
}