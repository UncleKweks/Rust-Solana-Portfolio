'use client';

import toast from 'react-hot-toast';

export function useTransactionToast() {
  return (signature: string) => {
    const url = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    toast.success(
      (t) => (
        <span>
          ✅ Transaction sent:&nbsp;
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
            View on Explorer
          </a>
        </span>
      ),
      { duration: 6000 }
    );
  };
}
