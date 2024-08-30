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

export default function History() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [transactions, setTransactions] = useState<(ParsedTransactionWithMeta | null)[]>([]);
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
        fetchTransactionData();
    }, [publicKey, connection]);

    // Find index of user's public key in accountKeys
    const findAccountIndex = (tx: ParsedTransactionWithMeta | null): number => {
        if (!tx?.transaction || !publicKey) {
            return -1;
        }
        const accountIndex = tx.transaction.message.accountKeys.findIndex((key) =>
            key.pubkey.equals(publicKey)
        );
        return accountIndex;
    }

    const getTransactionChange = (tx: ParsedTransactionWithMeta | null) => {
        if (!tx?.meta || !tx.meta.preBalances || !tx.meta.postBalances) {
            return 0; // Return 0 if no balance information is available
        }

        const accountIndex = findAccountIndex(tx);
        if (accountIndex === -1) {
            return '0.00'; // User's public key not involved in this transaction
        }

        const preBalanceLamports = tx.meta.preBalances[accountIndex] || 0;
        const postBalanceLamports = tx.meta.postBalances[accountIndex] || 0;
        const change = (postBalanceLamports - preBalanceLamports) / LAMPORTS_PER_SOL;

        return change.toFixed(2); // Calculate the change
    };

    const getPostBalance = (tx: ParsedTransactionWithMeta | null) => {
        if (!tx?.meta || !tx.meta.postBalances || !tx.transaction.message.accountKeys || !publicKey) {
            return 'N/A'; // Return 'N/A' if no post balance information is available
        }
        const accountIndex = findAccountIndex(tx);
        if (accountIndex === -1) {
            return 'N/A'; // User's public key not involved in this transaction
        }
        // Get the corresponding post balance for the user's account
        const postBalanceLamports = tx.meta.postBalances[accountIndex];
        const postBalance = (postBalanceLamports / LAMPORTS_PER_SOL).toFixed(2);
    
        return postBalance;
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
                    <TableColumn maxWidth={100}>TXID</TableColumn>
                    <TableColumn maxWidth={150}>STATUS</TableColumn>
                    <TableColumn>CHANGE</TableColumn>
                    <TableColumn>POST BALANCE</TableColumn>
                </TableHeader>
                <TableBody emptyContent={" No transactions found"}>
                    {
                        items.map((tx, index) => {
                            let transactionChange = getTransactionChange(tx);
                            let postBalance = getPostBalance(tx);
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