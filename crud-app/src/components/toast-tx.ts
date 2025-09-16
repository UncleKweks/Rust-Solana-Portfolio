import { toast } from 'sonner'

// Minimal helper to satisfy imports; customize as needed.
export function toastTx(message: string | Promise<unknown>) {
    if (typeof message === 'string') {
        toast(message)
        return
    }
    Promise.resolve(message)
        .then(() => toast('Transaction submitted'))
        .catch((err) => toast.error(err?.message || 'Transaction failed'))
}


