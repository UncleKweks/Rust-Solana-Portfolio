import React from "react";
import { PublicKey } from "@solana/web3.js";
import { PostWithMetadata } from "../hooks/useSocialPlatform";

type Props = {
    post: PostWithMetadata;
    onTip: () => void;
    onDelete?: () => void;
    loading: boolean;
    canDelete?: boolean;
};

export default function PostItem({
    post,
    onTip,
    onDelete,
    loading,
    canDelete = false
}: Props) {
    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const formatSolAmount = (lamports: number) => {
        return (lamports / 1_000_000_000).toFixed(3);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {post.author.toBase58()[0]}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">
                            {post.author.toBase58().slice(0, 4)}...{post.author.toBase58().slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formatTimestamp(post.timestamp.toNumber())}
                        </p>
                    </div>
                </div>
                {canDelete && onDelete && (
                    <button
                        onClick={onDelete}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50 px-2 py-1 rounded hover:bg-red-50"
                    >
                        🗑️ Delete
                    </button>
                )}
            </div>

            <p className="text-gray-800 mb-3 text-lg leading-relaxed">{post.content}</p>

            {post.imageUrl && (
                <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="w-full max-h-64 object-cover rounded-lg mb-3"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <button
                    onClick={onTip}
                    disabled={loading}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 disabled:opacity-50 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                    <span className="text-lg">💸</span>
                    <span className="font-medium">Tip 0.01 SOL</span>
                </button>

                <div className="flex items-center gap-4 text-sm">
                    <div className="text-gray-600">
                        <span className="font-medium">Tips:</span> {formatSolAmount(post.totalTipped.toNumber())} SOL
                    </div>

                    {post.totalTipped.toNumber() > 0 && (
                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            💰 Tipped
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Info */}
            <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    Post ID: {post.postId} • Author: {post.author.toBase58().slice(0, 8)}...{post.author.toBase58().slice(-8)}
                </p>
            </div>
        </div>
    );
}



