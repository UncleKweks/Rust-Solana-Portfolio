import React from "react";

type Props = {
    username?: string;
    addressShort: string;
    followers: number;
    following: number;
    postsCount: number;
    balance: number;
    loading: boolean;
    totalEarned?: number;
};

export default function ProfileCard({
    username,
    addressShort,
    followers,
    following,
    postsCount,
    balance,
    loading,
    totalEarned = 0
}: Props) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {username ? username[0].toUpperCase() : addressShort[0]}
                </div>
                <div>
                    <h2 className="text-xl font-bold">{username || "Anonymous"}</h2>
                    <p className="text-gray-600">{addressShort}</p>
                    <p className="text-sm text-gray-500">
                        Balance: {loading ? "..." : `${balance.toFixed(4)} SOL`}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 text-center mb-4">
                <div>
                    <p className="font-bold text-lg">{postsCount}</p>
                    <p className="text-gray-600 text-sm">Posts</p>
                </div>
                <div>
                    <p className="font-bold text-lg">{followers}</p>
                    <p className="text-gray-600 text-sm">Followers</p>
                </div>
                <div>
                    <p className="font-bold text-lg">{following}</p>
                    <p className="text-gray-600 text-sm">Following</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-green-600">{totalEarned.toFixed(3)}</p>
                    <p className="text-gray-600 text-sm">SOL Earned</p>
                </div>
            </div>

            {/* Tips Info */}
            {totalEarned > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                        💰 You've earned <span className="font-semibold">{totalEarned.toFixed(3)} SOL</span> from tips!
                    </p>
                </div>
            )}
        </div>
    );
}



