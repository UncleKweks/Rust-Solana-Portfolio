import { useState, useCallback, useEffect } from "react";
import { PublicKey, Connection, LAMPORTS_PER_SOL, Transaction, SystemProgram } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

// Devnet connection
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export interface PostWithMetadata {
    postId: number;
    author: PublicKey;
    content: string;
    imageUrl?: string;
    timestamp: { toNumber: () => number };
    totalTipped: { toNumber: () => number };
}

export interface UserProfile {
    username: string;
    followers: number;
    following: number;
    totalEarned: number;
}

export interface AppTransaction {
    id: string;
    type: 'post' | 'tip' | 'profile';
    amount?: number;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
    signature?: string;
}

export function useSocialPlatform() {
    const { publicKey, sendTransaction } = useWallet();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userPosts, setUserPosts] = useState<PostWithMetadata[]>([]);
    const [allPosts, setAllPosts] = useState<PostWithMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userBalance, setUserBalance] = useState(0);
    const [transactions, setTransactions] = useState<AppTransaction[]>([]);

    // Fetch user balance
    const fetchUserBalance = useCallback(async () => {
        if (!publicKey) return;

        try {
            const balance = await connection.getBalance(publicKey);
            setUserBalance(balance / LAMPORTS_PER_SOL);
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        }
    }, [publicKey]);

    // Update balance periodically
    useEffect(() => {
        if (publicKey) {
            fetchUserBalance();
            const interval = setInterval(fetchUserBalance, 10000);
            return () => clearInterval(interval);
        }
    }, [publicKey, fetchUserBalance]);

    // Add transaction to history
    const addTransaction = useCallback((tx: Omit<AppTransaction, 'id'>) => {
        const newTx: AppTransaction = {
            ...tx,
            id: Date.now().toString(),
        };
        setTransactions(prev => [newTx, ...prev]);
    }, []);

    // Update transaction status
    const updateTransactionStatus = useCallback((id: string, status: 'confirmed' | 'failed', signature?: string) => {
        setTransactions(prev => prev.map(tx =>
            tx.id === id ? { ...tx, status, signature } : tx
        ));
    }, []);

    const initializeUser = useCallback(async () => {
        if (!publicKey) throw new Error("Wallet not connected");

        setLoading(true);
        setError(null);

        try {
            // Add pending transaction
            addTransaction({
                type: 'profile',
                timestamp: Date.now(),
                status: 'pending'
            });

            // Simulate blockchain transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey,
                    lamports: 0
                })
            );

            const signature = await sendTransaction(transaction, connection);

            // Create profile
            const profile: UserProfile = {
                username: `User_${publicKey.toBase58().slice(0, 6)}`,
                followers: 0,
                following: 0,
                totalEarned: 0
            };

            setUserProfile(profile);

            // Update transaction status
            updateTransactionStatus(transactions[0]?.id || '', 'confirmed', signature);

            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to initialize profile";
            setError(errorMessage);

            // Update transaction status
            if (transactions.length > 0) {
                updateTransactionStatus(transactions[0].id, 'failed');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [publicKey, sendTransaction, addTransaction, updateTransactionStatus, transactions]);

    const createPost = useCallback(async (content: string, imageUrl?: string) => {
        if (!publicKey) throw new Error("Wallet not connected");

        setLoading(true);
        setError(null);

        try {
            // Add pending transaction
            addTransaction({
                type: 'post',
                timestamp: Date.now(),
                status: 'pending'
            });

            // Simulate blockchain transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey,
                    lamports: 0
                })
            );

            const signature = await sendTransaction(transaction, connection);

            // Create post object
            const post: PostWithMetadata = {
                postId: Date.now(),
                author: publicKey,
                content,
                imageUrl,
                timestamp: { toNumber: () => Date.now() },
                totalTipped: { toNumber: () => 0 }
            };

            // Update posts safely
            setUserPosts(prev => [post, ...prev]);
            setAllPosts(prev => [post, ...prev]);

            // Update transaction status
            updateTransactionStatus(transactions[0]?.id || '', 'confirmed', signature);

            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create post";
            setError(errorMessage);

            // Update transaction status
            if (transactions.length > 0) {
                updateTransactionStatus(transactions[0].id, 'failed');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [publicKey, sendTransaction, addTransaction, updateTransactionStatus, transactions]);

    const tipPost = useCallback(async (authorPublicKey: PublicKey, postId: number, amount: number) => {
        if (!publicKey) throw new Error("Wallet not connected");

        setLoading(true);
        setError(null);

        try {
            // Add pending transaction
            addTransaction({
                type: 'tip',
                amount,
                timestamp: Date.now(),
                status: 'pending'
            });

            // Simulate blockchain transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: authorPublicKey,
                    lamports: amount * LAMPORTS_PER_SOL
                })
            );

            const signature = await sendTransaction(transaction, connection);

            // Update posts with tip
            setAllPosts(prev => prev.map(post =>
                post.postId === postId
                    ? { ...post, totalTipped: { toNumber: () => post.totalTipped.toNumber() + amount } }
                    : post
            ));

            // Update transaction status
            updateTransactionStatus(transactions[0]?.id || '', 'confirmed', signature);

            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to tip post";
            setError(errorMessage);

            // Update transaction status
            if (transactions.length > 0) {
                updateTransactionStatus(transactions[0].id, 'failed');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [publicKey, sendTransaction, addTransaction, updateTransactionStatus, transactions]);

    const deletePost = useCallback(async (postId: number) => {
        if (!publicKey) throw new Error("Wallet not connected");

        setLoading(true);
        setError(null);

        try {
            // Remove post from state
            setUserPosts(prev => prev.filter(post => post.postId !== postId));
            setAllPosts(prev => prev.filter(post => post.postId !== postId));

            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete post";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [publicKey]);

    const fetchAllPosts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // For now, just set empty posts
            setAllPosts([]);
            setUserPosts([]);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch posts";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const checkUserProfile = useCallback(async () => {
        if (!publicKey) return false;
        return false; // Always return false for now to show profile init
    }, [publicKey]);

    const getUserBalance = useCallback(async () => {
        if (!publicKey) return 0;

        try {
            const balance = await connection.getBalance(publicKey);
            return balance / LAMPORTS_PER_SOL;
        } catch (err) {
            console.error("Failed to get balance:", err);
            return 0;
        }
    }, [publicKey]);

    const lamportsToSol = useCallback((lamports: number) => {
        return lamports / LAMPORTS_PER_SOL;
    }, []);

    return {
        userProfile,
        userPosts,
        allPosts,
        loading,
        error,
        userBalance,
        transactions,
        initializeUser,
        createPost,
        tipPost,
        deletePost,
        fetchAllPosts,
        checkUserProfile,
        getUserBalance,
        lamportsToSol
    };
}
