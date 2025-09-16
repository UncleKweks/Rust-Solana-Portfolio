import React from "react";
import { AppTransaction } from "../hooks/useSocialPlatform";

type Props = {
    transactions: AppTransaction[];
    loading: boolean;
};

export default function TransactionHistory({ transactions, loading }: Props) {
    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'post': return '📝';
            case 'tip': return '💸';
            case 'profile': return '👤';
            default: return '🔗';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{getTransactionIcon(tx.type)}</span>
                            <div>
                                <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                                <p className="text-sm text-gray-500">{formatTimestamp(tx.timestamp)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {tx.amount && (
                                <p className="font-semibold text-purple-600">+{tx.amount.toFixed(3)} SOL</p>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                                {tx.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {transactions.length > 5 && (
                <p className="text-center text-sm text-gray-500 mt-3">
                    Showing 5 of {transactions.length} transactions
                </p>
            )}
        </div>
    );
}
