"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";
import { LAMPORTS_PER_SOL, ParsedInstruction, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
  } from "@nextui-org/table";
import { Pagination } from "@nextui-org/pagination"
import HistoryIcon from "../components/icons/HistoryIcon";
import { fetchAssociatedAccountByMintAddress, fetchTokenByAccount, useTokenDataById, useTokenDataWithAddress } from "@/api/token";
import Image from "next/image";

export default function History() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [transactions, setTransactions] = useState<(ParsedTransactionWithMeta | null)[]>([]);
    const [tokenAddress, setTokenAddresses] = useState<PublicKey[]>([]);
    const [contractAddresses, setContractAddresses] = useState<string[]>([]);
    const [lastSignature, setLastSignature] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const pages = Math.ceil(transactions.length / rowsPerPage);

    // Memoize transactions slice to avoid re-computation on every render
    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return transactions.slice(start, end);
    }, [page, transactions]);

    const { token: tokens, isLoading: isTokenLoading, isError: isTokenError } = useTokenDataWithAddress(contractAddresses);
    const { token, isLoading: isSolLoading, isError: isSolError } = useTokenDataById('solana');

    useEffect(() => {
        const fetchContractAddresses = async () => {
            if (!publicKey || !connection) return;

            const fetchedTokenAccounts = await fetchTokenByAccount(publicKey, connection);
            const addresses = fetchedTokenAccounts.map((token) => token.mintAddress);
            setContractAddresses(addresses);
        };
        fetchContractAddresses();
    }, [publicKey, connection]);

    useEffect(() => {
        if (!publicKey || !connection) return;

        const fetchTokenAddresses = async () => {
            try {
                const fetchedAccounts = await fetchAssociatedAccountByMintAddress(publicKey, connection);
                setTokenAddresses([publicKey, ...fetchedAccounts]);
            } catch (error) {
                console.error('Failed to fetch associated token address: ', error);
            }
        };

        const fetchTransactionData = async () => {
            try {
                const fetchedSignatures = await connection.getSignaturesForAddress(publicKey, {
                    before: lastSignature || undefined,
                    limit: rowsPerPage
                });
                setLastSignature(fetchedSignatures[fetchedSignatures.length - 1].signature);
                const fetchedTransactions = await Promise.all(
                    fetchedSignatures.map(async (sigInfo) => {
                        const tx = await connection.getParsedTransaction(sigInfo.signature, { maxSupportedTransactionVersion: 0 });
                        return tx;
                    })
                );
                setTransactions(fetchedTransactions);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            }
        };

        fetchTokenAddresses().then(fetchTransactionData);
    }, [publicKey, connection, lastSignature]);


        // Find index of user's public key in accountKeys
    const findAccountIndex = (tx: ParsedTransactionWithMeta | null, accountPubKey: PublicKey): number => {
        if (!tx?.transaction) {
            return -1;
        }
        const accountIndex = tx.transaction.message.accountKeys.findIndex((key) =>
            key.pubkey.equals(accountPubKey)
        );
        return accountIndex;
    };

    // const getTransactionChange = (tx: ParsedTransactionWithMeta | null, accountPubKeys: PublicKey[]) => {
    //     let totalChange = 0;
    //     let changeType = '';
    
    //     accountPubKeys.forEach((accountPubKey) => {
    //         if (!tx?.meta || (!tx.meta.preBalances && !tx.meta.preTokenBalances) || (!tx.meta.postBalances && !tx.meta.postTokenBalances)) {
    //             return;
    //         }
    
    //         const accountIndex = findAccountIndex(tx, accountPubKey);
    
    //         // Check if it's a SOL transaction
    //         if (accountIndex !== -1 && tx.meta.preBalances && tx.meta.postBalances) {
    //             const preBalanceLamports = tx.meta.preBalances[accountIndex] || 0;
    //             const postBalanceLamports = tx.meta.postBalances[accountIndex] || 0;
    //             console.log("Transaction", tx);
    //             const change = (postBalanceLamports - preBalanceLamports) / LAMPORTS_PER_SOL;
    //             totalChange += change;
    
    //             changeType = change > 0 ? 'Received' : 'Transferred';
    //         }
    
    //         // Check if it's a token transaction
    //         const tokenBalanceChange = tx.meta.preTokenBalances?.find((b) => b.accountIndex === accountIndex);
    //         // console.log("Balance Change", tokenBalanceChange);
    //         const tokenPostBalance = tx.meta.postTokenBalances?.find((b) => b.accountIndex === accountIndex);
    //         console.log("Post Change", tokenPostBalance);

    //         if (tokenBalanceChange && tokenPostBalance) {
    //             // Adjust the balance change according to the token's decimals
    //             const preBalanceTokens = parseFloat(tokenBalanceChange.uiTokenAmount.uiAmountString || "0");
    //             const postBalanceTokens = parseFloat(tokenPostBalance.uiTokenAmount.uiAmountString || "0");
    
    //             // Get the decimal places for the token
    //             const decimals = tokenBalanceChange.uiTokenAmount.decimals;
    //             const change = (postBalanceTokens - preBalanceTokens) / Math.pow(10, decimals);
    //             totalChange += change;
    
    //             changeType = change > 0 ? 'Received' : 'Transferred';
    //         }
    //     });
    
    //     return { totalChange, changeType };
    // }

    const getTransactionChange = (tx: ParsedTransactionWithMeta | null, accountPubKeys: PublicKey[]) => {
        let totalChange = 0;
        let changeType = '';
    // Change to search by mint address
        accountPubKeys.forEach((accountPubKey) => {
            if (!tx?.meta) return;
    
            const accountIndex = findAccountIndex(tx, accountPubKey);
            if (accountIndex === -1) return;
    
            // SOL balance case
            if (tx.meta.preBalances && tx.meta.postBalances) {
                const preBalanceLamports = tx.meta.preBalances[accountIndex] || 0;
                const postBalanceLamports = tx.meta.postBalances[accountIndex] || 0;
    
                const change = (postBalanceLamports - preBalanceLamports) / LAMPORTS_PER_SOL;
                totalChange += change;
    
                changeType = change > 0 ? 'Received' : 'Transferred';
            }
    
            // Additional handling for token transactions (legacy)
            const tokenBalanceChange = tx.meta.preTokenBalances?.find((b) => b.accountIndex === accountIndex);
            const tokenPostBalance = tx.meta.postTokenBalances?.find((b) => b.accountIndex === accountIndex);
            // preTokenBalances or postTokenBalances is undefined at account index if amount is 0
            if (tokenBalanceChange || tokenPostBalance) {
                const preBalanceTokens = tokenBalanceChange?.uiTokenAmount.uiAmount || 0;
                const postBalanceTokens = tokenPostBalance?.uiTokenAmount.uiAmount || 0;
                const change = postBalanceTokens - preBalanceTokens;
                totalChange += change;
    
                changeType = change > 0 ? 'Received' : 'Transferred';
            }
        });
    
        return { totalChange, changeType };
    };

    const getPostBalance = (tx: ParsedTransactionWithMeta | null, accountPubKeys: PublicKey[]) => {
        let totalPostBalance = 0;
    
        accountPubKeys.forEach((accountPubKey) => {
            const accountIndex = findAccountIndex(tx, accountPubKey);
            if (accountIndex === -1) {
                return;
            }
    
            // SOL balance case
            if (tx?.meta?.postBalances) {
                const postBalanceLamports = tx.meta.postBalances[accountIndex] || 0;
                const postBalance = (postBalanceLamports / LAMPORTS_PER_SOL);
                totalPostBalance += postBalance;
            }
    
            // Token balance case
            const tokenPostBalance = tx?.meta?.postTokenBalances?.find((b) => b.accountIndex === accountIndex);
            if (tokenPostBalance) {
                const postBalanceTokens = parseFloat(tokenPostBalance.uiTokenAmount.uiAmountString || "0");
                totalPostBalance += postBalanceTokens;
            }
        });
    
        return totalPostBalance.toFixed(6);
    };
    // Memoize the token list to avoid re-creating it on every render
    const tokenList = useMemo(() => {
        return [...tokens, token];
    }, [tokens, token]);

    return (
        <div className="w-screen p-5">
            <div className="flex items-center gap-4">
                <HistoryIcon className="w-8 h-auto" />
                <h1 className="lg:text-2xl text-xl font-bold">Transaction History</h1>
            </div>
            <Table 
                className="lg:my-4 my-2" 
                aria-label="Transaction History"
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="default"
                            page={page}
                            total={pages}
                            onChange={(page) => setPage(page)}
                        />
                    </div>
                }>
                <TableHeader>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn maxWidth={50}>TXID</TableColumn>
                    <TableColumn maxWidth={20}>STATUS</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>CHANGE</TableColumn>
                    <TableColumn>POST BALANCE</TableColumn>
                </TableHeader>
                <TableBody emptyContent={" No transactions found"}>
                    {
                        items.map((tx, index) => {
                            const transactionChange = getTransactionChange(tx, tokenAddress);
                            const postBalance = getPostBalance(tx, tokenAddress);

                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        {tx?.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {tx?.transaction.signatures[0]}
                                    </TableCell>
                                    <TableCell>
                                        {tx?.meta?.err ? 'Failed' : 'Success'}
                                    </TableCell>
                                    <TableCell>
                                        {transactionChange.changeType}
                                    </TableCell>
                                    <TableCell>
                                        <Image 
                                            src={tokenList[index].image.large}
                                            alt={tokenList[index].symbol}
                                            aria-label={tokenList[index].symbol}
                                            className="w-4 h-auto"
                                            width={50}
                                            height={50}
                                        />
                                        <span>
                                        {
                                            transactionChange.totalChange < 0 ? '-' : 
                                            `${transactionChange.totalChange.toFixed(6)}`
                                        }
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Image 
                                            src={tokenList[index].image.large}
                                            alt={tokenList[index].symbol}
                                            aria-label={tokenList[index].symbol}
                                            className="w-4 h-auto"
                                            width={50}
                                            height={50}
                                        />
                                        <span className="uppercase">
                                        {postBalance}
                                        </span>
                                    </TableCell>
                                </TableRow>

                            );
                        })
                    }
                </TableBody>
            </Table>
        </div>
    );
}
