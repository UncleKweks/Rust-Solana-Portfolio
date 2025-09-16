import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from "../../anchor_project/target/idl/social_platform.json";

// Your deployed program ID (from `anchor deploy`)
const PROGRAM_ID = new PublicKey("3fAf1f2xVmJxSuUkV9RXs8jkLLFUj51YDmS4DUjXao7Z");

// Network configuration
const NETWORK = "https://api.devnet.solana.com";

export const getProgram = () => {
    const wallet = useWallet();
    const connection = new Connection(NETWORK, "processed");

    // Create the provider
    const provider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: "processed",
        commitment: "processed",
    });

    // ✅ Correct argument order: (idl, provider) - programId is extracted from IDL
    // OR (idl, programId, provider) if you want to override the program ID
    return new Program(idl as Idl, provider);
};

// Alternative approach if you want to explicitly specify the program ID
export const getProgramWithId = () => {
    const wallet = useWallet();
    const connection = new Connection(NETWORK, "processed");

    const provider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: "processed",
        commitment: "processed",
    });

    // Create program with explicit program ID
    const program = new Program(idl as Idl, provider);
    // Override the program ID if it differs from the IDL
    (program as any).programId = PROGRAM_ID;

    return program;
};

// Helper functions for PDA derivation
export const getUserProfilePDA = (userPublicKey: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), userPublicKey.toBuffer()],
        PROGRAM_ID
    );
};

export const getPostPDA = (authorPublicKey: PublicKey, postId: number): [PublicKey, number] => {
    const postIdBuffer = Buffer.alloc(8);
    postIdBuffer.writeBigUInt64LE(BigInt(postId), 0);

    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("post"),
            authorPublicKey.toBuffer(),
            postIdBuffer
        ],
        PROGRAM_ID
    );
};

// Type definitions for better TypeScript support
export interface UserProfile {
    owner: PublicKey;
    postCount: BN;
    balance: BN;
    bump: number;
}

export interface Post {
    author: PublicKey;
    content: string;
    imageUrl: string | null;
    timestamp: BN;
    tipsReceived: BN;
    postId: BN;
    bump: number;
}

// Utility functions
export const lamportsToSol = (lamports: number | BN): number => {
    const lamportsBN = typeof lamports === 'number' ? new BN(lamports) : lamports;
    return lamportsBN.toNumber() / 1e9; // LAMPORTS_PER_SOL
};

export const solToLamports = (sol: number): BN => {
    return new BN(sol * 1e9);
};

// Export constants
export { PROGRAM_ID, NETWORK };