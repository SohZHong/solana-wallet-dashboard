"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useEffect } from "react";

const WalletBalance = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number>(0);
 
    useEffect(() => {
        if (publicKey) {
            (async function getBalanceEvery10Seconds() {
                const newBalance = await connection.getBalance(publicKey);
                setBalance(newBalance / LAMPORTS_PER_SOL);
                setTimeout(getBalanceEvery10Seconds, 10000);
            })();
        }
    }, [publicKey, connection, balance]);

    return (
        <div>
            {balance} SOL
        </div>
    )
}

export default WalletBalance