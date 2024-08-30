import axios, { AxiosResponse } from "axios";

export const fetchTokenPrice = async (token: string) => {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
    )
    .catch((err) => {
      console.error(`Failed to fetch ${token} price:`, err);
    })
    return response
  }