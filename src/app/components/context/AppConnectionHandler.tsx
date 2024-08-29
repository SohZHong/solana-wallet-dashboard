"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import ConnectNotice from "../ConnectNotice";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const AppConnectionHandler = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    const { publicKey } = useWallet();

    const animationVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
    };

    return (
    <React.Fragment>
        <AnimatePresence mode="wait" initial={false}>
        {publicKey ? (
            <motion.div
            key="connected"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={animationVariants}
            transition={{ duration: 0.3 }}
            >
            {children}
            </motion.div>
        ) : (
            <motion.div
            key="connect-notice"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={animationVariants}
            transition={{ duration: 0.3 }}
            >
            <ConnectNotice />
            </motion.div>
        )}
        </AnimatePresence>
    </React.Fragment>
    );
}

export default AppConnectionHandler