"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import React from "react";
import ConnectNotice from "../components/ConnectNotice";

export default function History() {
    const { publicKey } = useWallet();

    return (
        <React.Fragment>
            {publicKey ? (
                <section className="flex items-center justify-center min-h-screen">
                    <div className="font-bold">
                    </div>
                </section>
            ) : 
            (
                <ConnectNotice />
            )}
        </React.Fragment>
    );
}