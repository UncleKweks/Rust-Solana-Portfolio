import { useConnection, useWallet } from '@solana/wallet-adapter-react'

/**
 * Custom hook to abstract Wallet UI and related functionality from your app.
 *
 * This is a great place to add custom shared Solana logic or clients.
 */
export function useSolana() {
  const { connection } = useConnection()
  const wallet = useWallet()

  return {
    connection,
    account: wallet.publicKey ? { address: wallet.publicKey.toBase58() } : null,
    wallet,
  }
}
