'use client';

import toast from 'react-hot-toast';

export function useTransactionToast() {
    return (signature: string) => {
        toast.success(
            `Transaction sent: ${signature}`,
            {
                duration: 5000,
            }
        );
    };
}
