"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
import ConnectNotice from "../components/ConnectNotice";
import { ParsedInstruction, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
  } from "@nextui-org/table";

export default function History() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [ transactions, setTransactions] = useState<(ParsedTransactionWithMeta | null)[]>([]);

    useEffect(() => {
        if (!publicKey) return; // Exit if no public key is available
    
        const fetchTransactionData = async () => {
          try {
            // Get signatures for the current wallet address
            const fetchedSignatures = await connection.getSignaturesForAddress(publicKey);
    
            // Extract signature strings to pass into getTransactions
            const signatureList = fetchedSignatures.map(sigInfo => sigInfo.signature);
    
            // Fetch the transactions based on the signatures
            const fetchedTransactions = await connection.getParsedTransactions(signatureList);
            setTransactions(fetchedTransactions);
        } catch (error) {
        console.error('Failed to fetch transactions:', error);
        }
    };
        fetchTransactionData();
    }, [publicKey, connection]);

    const getTransactionDetails = (instructions: ParsedInstruction[]) => {
        let transferType: string = 'Invalid';
        let isOutgoing: boolean = false;
        let amount: number = 0;
        if (publicKey) {
            for (let instruction of instructions) {
                if (instruction.program === 'spl-token') {
                    const { type, info } = instruction.parsed;
                    switch (type) {
                        case 'transfer':
                            transferType = 'Transfer';
                            info.amount = amount;
                            break;
                        case 'transferChecked':
                            transferType = 'Transfer';
                            info.amount = amount;
                            break;
                        case 'mintTo':
                            transferType = 'Receive';
                            info.amount = amount;
                            break;
                        case 'burn':
                            transferType = 'Burn';
                            info.amount = amount;
                            break;
                        default:
                            transferType = 'Unknown';
                            break;
                    }
    
                    // Determine if it's outgoing or incoming
                    if (type === 'transfer' || type === 'transferChecked') {
                        if (info.source && new PublicKey(info.source).equals(publicKey)) {
                            isOutgoing = true; // Outgoing transaction
                        } else if (info.destination && new PublicKey(info.destination).equals(publicKey)) {
                            isOutgoing = false; // Incoming transaction
                        }
                    }
                }
            }
        }
        return { transferType, isOutgoing, amount };
    };

    return (
        <React.Fragment>
            {publicKey ? (
                <div className="w-screen md:p-5 p-2">
                    <h1 className="lg:text-2xl md:text-xl sm:text-lg font-bold">Transaction History</h1>
                    <Table className="lg:my-4 md:my-2" aria-label="Transaction History">
                        <TableHeader>
                            <TableColumn>DATE</TableColumn>
                            <TableColumn>TXID</TableColumn>
                            <TableColumn>TYPE</TableColumn>
                            <TableColumn>OUTGOING</TableColumn>
                            <TableColumn>INGOING</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {
                                transactions.length === 0 ?
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No transactions found
                                    </TableCell>
                                    <TableCell className="hidden"> </TableCell>
                                    <TableCell className="hidden"> </TableCell>
                                    <TableCell className="hidden"> </TableCell>
                                    <TableCell className="hidden"> </TableCell>
                                </TableRow>:
                                transactions.map((tx, index) => {
                                    const { transferType, isOutgoing, amount }= tx ? getTransactionDetails(tx.transaction.message.instructions as ParsedInstruction[]) : { transferType: 'Invalid', isOutgoing: false, amount: 0 };
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {tx?.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {tx?.transaction.signatures[0]}
                                            </TableCell>
                                            <TableCell>
                                                {transferType}
                                            </TableCell>
                                            <TableCell>
                                                {isOutgoing && 
                                                    <React.Fragment>
                                                        {amount}
                                                    </React.Fragment>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {isOutgoing! && 
                                                    <React.Fragment>
                                                        {amount}
                                                    </React.Fragment>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                        </TableBody>
                    </Table>
                </div>
            ) : 
            (
                <ConnectNotice />
            )}
        </React.Fragment>
    );
}