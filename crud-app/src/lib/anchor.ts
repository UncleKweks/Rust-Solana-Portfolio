"use client";

import * as anchor from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import idl from '@/idl/crud_backend.json'

export const PROGRAM_ID = new PublicKey((idl as any).address)
const opts = { preflightCommitment: 'processed' as const }

export async function getProgramFromWalletUi(sol: any) {
    const connection: Connection = sol?.connection ?? new Connection('https://api.devnet.solana.com', opts.preflightCommitment)

    // Prefer injected Phantom
    let adapter: any = typeof window !== 'undefined' ? ((window as any)?.solana ?? (window as any)?.phantom?.solana) : null
    if (adapter?.isPhantom && !adapter.publicKey) {
        try {
            await adapter.connect?.({ onlyIfTrusted: false })
        } catch { }
    }
    // Fallback to wallet-ui adapter if it can sign
    if ((!adapter || !adapter.signTransaction) && sol?.wallet?.adapter) {
        adapter = sol.wallet.adapter
    }

    if (!adapter?.publicKey || !adapter?.signTransaction) {
        throw new Error('Wallet not connected or missing signing capabilities')
    }

    const anchorWallet: anchor.Wallet = {
        publicKey: adapter.publicKey as PublicKey,
        signTransaction: adapter.signTransaction.bind(adapter),
        signAllTransactions: adapter.signAllTransactions
            ? adapter.signAllTransactions.bind(adapter)
            : async (txs: any[]) => {
                const out: any[] = []
                for (const tx of txs) out.push(await adapter.signTransaction(tx))
                return out
            },
    }

    const provider = new anchor.AnchorProvider(connection, anchorWallet, opts as any)
    return new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider)
}

export { SystemProgram }


