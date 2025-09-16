'use client';

import { useMemo, PropsWithChildren } from 'react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

export function useAnchorProvider(): AnchorProvider | null {
  const wallet = useWallet();
  const endpoint = clusterApiUrl('devnet');

  return useMemo(() => {
    if (!wallet || !wallet.publicKey) return null;

    // Create Solana connection
    const connection = new Connection(endpoint, 'confirmed');

    // ✅ Return a full AnchorProvider, not PublicKey
    return new AnchorProvider(connection, wallet as any, {
      preflightCommitment: 'processed',
    });
  }, [wallet, endpoint]);
}

export function SolanaProvider({ children }: PropsWithChildren<{}>) {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
