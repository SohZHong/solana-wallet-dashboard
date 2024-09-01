import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const getWalletBalance = async (
    connection: Connection,
    publicKey : PublicKey | null
) => {
    try {
        if (!publicKey) {
            throw new Error("Wallet is not Connected");
        }
        const newBalance = await connection.getBalance(publicKey);
        return (newBalance / LAMPORTS_PER_SOL);
    } catch (err) {
        console.error('Error obtaining wallet balance: ', err);
        return 0;
    }
}

export default getWalletBalance