"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
 
require("@solana/wallet-adapter-react-ui/styles.css");

export default function AppWalletProvider( { children }: {children: React.ReactNode} ) {
    const [selectedNetwork, setSelectedNetwork] = useState<WalletAdapterNetwork>();

    // Fetch network from localStorage on first render
    useEffect(() => {
        const network = localStorage.getItem('selectedNetwork');
        setSelectedNetwork(network ? (network as WalletAdapterNetwork) : WalletAdapterNetwork.Devnet);
    }, []);

    // Select endpoint based on selected network
    const endpoint = useMemo(() => {
        if (selectedNetwork === WalletAdapterNetwork.Mainnet) {
            return process.env.NEXT_PUBLIC_QUICKNODE_MAIN_RPC_URL || clusterApiUrl(WalletAdapterNetwork.Mainnet);
        } else {
            return process.env.NEXT_PUBLIC_QUICKNODE_DEV_RPC_URL || clusterApiUrl(WalletAdapterNetwork.Devnet);
        }
    }, [selectedNetwork]);
    
    const wallets = useMemo(
        () => [
        // manually add any legacy wallet adapters here
        // new UnsafeBurnerWalletAdapter(),
        ],
        [selectedNetwork],
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
        </ConnectionProvider>
    );
}