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

export interface Token {
  id: string;
  symbol: string;
  name: string;
  token: any;
  image?: string,
  current_price?: number
}

interface TokenMapping {
  [key: string]: Token;
}

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

    const tokenMap = useMemo(() => {
        let map = new Map<string, any>();
        tokens.forEach((token) => {
            map.set(token.platforms.solana, token);
        });
        map.set('solana', token);
        return map;
    }, [tokens, token, contractAddresses]);

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
                    before: lastSignature || undefined
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

    const getTransactionDetails = (tx: ParsedTransactionWithMeta | null, accountPubKeys: PublicKey[]) => {
        let change = 0;
        let type = '';
        let postBalance = '0';
        let mint = '';

        accountPubKeys.forEach((accountPubKey) => {
            if (!tx?.meta) return;
    
            const accountIndex = findAccountIndex(tx, accountPubKey);
            if (accountIndex === -1) return;
            const { totalChange, changeType } = getTransactionChange(tx, accountIndex);
            change = totalChange;
            type = changeType;
            postBalance = getPostBalance(tx, accountIndex);
            const tokenInstructions = tx.transaction.message.instructions as ParsedInstruction[];
            for (const instruction of tokenInstructions) {
                if (instruction?.parsed?.info?.mint) {
                    mint = instruction.parsed.info.mint;
                    break; // Exit once mint is found
                }
            }
        });
    
        return { change, type, postBalance, mint };
    };

    const getTransactionChange = (tx: ParsedTransactionWithMeta, accountIndex: number) => {

        let totalChange = 0;
        let changeType = 'Unknown';

        if (!tx?.meta) return { totalChange, changeType };
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
        return { totalChange, changeType };
    }

    const getPostBalance = (tx: ParsedTransactionWithMeta, accountIndex: number) => {
        let totalPostBalance = 0;
    
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
    
        return totalPostBalance.toFixed(6);
    };

    // Memoize the token list to avoid re-creating it on every render
    // const tokenList = useMemo(() => {
    //     return [...tokens, token];
    // }, [tokens, token]);

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
                            const txDetails = getTransactionDetails(tx, tokenAddress);
                            const tokenDetails = tokenMap.get((txDetails.mint ? txDetails.mint : 'solana'));
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
                                        {txDetails.type}
                                    </TableCell>
                                    <TableCell>
                                        <span className="flex flex-row items-center gap-2">
                                        {
                                            tokenDetails && 
                                            <Image 
                                            src={tokenDetails.image.large}
                                            alt={tokenDetails.symbol}
                                            aria-label={tokenDetails.symbol}
                                            className="w-4 h-auto"
                                            width={50}
                                            height={50}
                                        />
                                        }
                                        {
                                            txDetails.change < 0 ? '-' : 
                                            `${txDetails.change.toFixed(6)}`
                                        }
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="flex flex-row items-center gap-2">
                                        {
                                            tokenDetails && 
                                            <Image 
                                            src={tokenDetails.image.large}
                                            alt={tokenDetails.symbol}
                                            aria-label={tokenDetails.symbol}
                                            className="w-4 h-auto"
                                            width={50}
                                            height={50}
                                        />
                                        }
                                        {txDetails.postBalance}
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
