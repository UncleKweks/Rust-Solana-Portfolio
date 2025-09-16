'use client';

import { useEffect, useState, useCallback } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useCrudProgram } from './crud-data-access';
import { CrudList, CrudCreate, CrudEdit } from './crud-ui';
import { BookOpen, ChefHat, Leaf, HelpCircle, Wallet } from 'lucide-react';

export default function CrudFeature() {
    const { connected, publicKey } = useWallet();
    const { entries, createEntry, updateEntry, deleteEntry } = useCrudProgram();

    return (
        <div className="min-h-screen bg-background">
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold text-foreground mb-4">CRUD</h1>
                    <p className="text-xl text-muted-foreground">Create, Read, Update, Delete entries on Solana</p>
                </div>

                {/* Connection Status */}
                {!connected ? (
                    <div className="max-w-md mx-auto">
                        <div className="card">
                            <div className="card-content text-center space-y-6">
                                <div className="space-y-2">
                                    <Wallet className="w-12 h-12 mx-auto text-primary" />
                                    <h2 className="text-2xl font-semibold">Connect Your Wallet</h2>
                                    <p className="text-muted-foreground">
                                        Connect your Solana wallet to start creating and managing entries on the blockchain.
                                    </p>
                                </div>

                                <WalletMultiButton className="wallet-adapter-button" />

                                <div className="text-sm text-muted-foreground">
                                    <p>Supported wallets:</p>
                                    <p>Phantom, Solflare, and more</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Connected Status */}
                        <div className="card">
                            <div className="card-content text-center">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400">Wallet Connected!</h2>
                                    <p className="text-muted-foreground">
                                        Address: <span className="font-mono">{publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">You can now create, edit, and delete entries on Solana</p>
                                </div>
                            </div>
                        </div>

                        {/* CRUD Interface */}
                        <div className="grid gap-6">
                            <CrudCreate onCreate={createEntry} />
                            <CrudList entries={entries} onUpdate={updateEntry} onDelete={deleteEntry} />
                        </div>
                    </div>
                )}

                {/* Resources Section */}
                <div className="mt-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">More Resources</h2>
                        <p className="text-muted-foreground">Expand your knowledge with these community and support links.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <a
                            href="https://docs.solana.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card hover:shadow-lg transition-shadow cursor-pointer group"
                        >
                            <div className="card-content text-center space-y-4">
                                <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Solana Docs</h3>
                                    <p className="text-sm text-muted-foreground">The official documentation. Your first stop for understanding the Solana ecosystem.</p>
                                </div>
                            </div>
                        </a>

                        <a
                            href="https://solanacookbook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card hover:shadow-lg transition-shadow cursor-pointer group"
                        >
                            <div className="card-content text-center space-y-4">
                                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ChefHat className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Solana Cookbook</h3>
                                    <p className="text-sm text-muted-foreground">Practical examples and code snippets for common tasks when building on Solana.</p>
                                </div>
                            </div>
                        </a>

                        <a
                            href="https://faucet.solana.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card hover:shadow-lg transition-shadow cursor-pointer group"
                        >
                            <div className="card-content text-center space-y-4">
                                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Leaf className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Solana Faucet</h3>
                                    <p className="text-sm text-muted-foreground">Get free test SOL for development and testing on Solana devnet.</p>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
