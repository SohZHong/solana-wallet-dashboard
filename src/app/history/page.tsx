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
import { fetchAssociatedAccountByMintAddress } from "@/api/token";

export default function History() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [transactions, setTransactions] = useState<(ParsedTransactionWithMeta | null)[]>([]);
    const [tokenAddress, setTokenAddresses] = useState<PublicKey[]>([]);
    const [lastSignature, setLastSignature] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const pages = Math.ceil(transactions.length / rowsPerPage);
    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
    
        return transactions.slice(start, end);
    }, [page, transactions]);
    
    useEffect(() => {
        if (!publicKey) return; // Exit if no public key is available

        const fetchTokenAddresses = async () => {
            try {
                const fetchedAccounts = await fetchAssociatedAccountByMintAddress(publicKey, connection);
                setTokenAddresses([publicKey, ...fetchedAccounts]);

            } catch (error) {
                console.error('Failed to fetch associated token address: ', error);
            }
        }

        const fetchTransactionData = async () => {
          try {
            // Get signatures for the current wallet address
            const fetchedSignatures = await connection.getSignaturesForAddress(publicKey, {
                before: lastSignature || undefined,
                limit: 15
            })
            // Get the last signature to fetch next batch
            setLastSignature(fetchedSignatures[fetchedSignatures.length - 1].signature);
            // Fetch the transactions based on the signatures
            const fetchedTransactions = await Promise.all(fetchedSignatures.map(async sigInfo => {
                const signature = sigInfo.signature;
                const tx = await connection.getParsedTransaction(signature, {maxSupportedTransactionVersion:0});
                return tx
            }))
            setTransactions(fetchedTransactions);
        } catch (error) {
        console.error('Failed to fetch transactions:', error);
        }
    };
    fetchTokenAddresses().then(fetchTransactionData);
    }, [publicKey, connection]);

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

    const getTransactionChange = (tx: ParsedTransactionWithMeta | null, accountPubKeys: PublicKey[]) => {
        let totalChange = 0;
    
        accountPubKeys.forEach((accountPubKey) => {
            if (!tx?.meta || (!tx.meta.preBalances && !tx.meta.preTokenBalances) || (!tx.meta.postBalances && !tx.meta.postTokenBalances)) {
                return;
            }
    
            // Check if it's a SOL transaction
            const accountIndex = findAccountIndex(tx, accountPubKey);
            if (accountIndex !== -1 && tx.meta.preBalances && tx.meta.postBalances) {
                const preBalanceLamports = tx.meta.preBalances[accountIndex] || 0;
                const postBalanceLamports = tx.meta.postBalances[accountIndex] || 0;
                const change = (postBalanceLamports - preBalanceLamports) / LAMPORTS_PER_SOL;
                totalChange += change;
            }
    
            // Check if it's a token transaction
            const tokenBalanceChange = tx.meta.preTokenBalances?.find((b) => b.accountIndex === accountIndex);
            const tokenPostBalance = tx.meta.postTokenBalances?.find((b) => b.accountIndex === accountIndex);
            if (tokenBalanceChange && tokenPostBalance) {
                const preBalanceTokens = parseFloat(tokenBalanceChange.uiTokenAmount.uiAmountString || "0");
                const postBalanceTokens = parseFloat(tokenPostBalance.uiTokenAmount.uiAmountString || "0");
                const change = postBalanceTokens - preBalanceTokens;
                totalChange += change;
            }
        });
    
        return totalChange;
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
    
        return totalPostBalance.toFixed(2);
    };
    

    return (
        <div className=" w-screen p-5">
            <div className="flex items-center gap-4">
                <HistoryIcon className="w-8 h-auto"/>
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
                    <TableColumn maxWidth={20}>TOKEN</TableColumn>
                    <TableColumn maxWidth={150}>STATUS</TableColumn>
                    <TableColumn>CHANGE</TableColumn>
                    <TableColumn>POST BALANCE</TableColumn>
                </TableHeader>
                <TableBody emptyContent={" No transactions found"}>
                    {
                        items.map((tx, index) => {
                            let transactionChange = getTransactionChange(tx, tokenAddress);
                            let postBalance = getPostBalance(tx, tokenAddress);
                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        {tx?.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {tx?.transaction.signatures[0]}
                                    </TableCell>
                                    <TableCell>
                                        SOL
                                    </TableCell>
                                    <TableCell>
                                        {tx?.meta?.err ? 'Failed' : 'Success'}
                                    </TableCell>
                                    <TableCell>
                                        {
                                            transactionChange === 0 ? '-' : '◎' + transactionChange
                                        }
                                    </TableCell>
                                    <TableCell>
                                        ◎
                                        {
                                            postBalance
                                        }
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    }
                </TableBody>
            </Table>
        </div>
    );
}