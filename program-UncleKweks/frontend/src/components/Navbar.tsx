import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { TrendingUp } from "lucide-react";

type Props = {
    address: string;
};

export default function Navbar({ address }: Props) {
    return (
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600/90">
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Solana Social</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">Devnet</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{address}</span>
                <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
            </div>
        </div>
    );
}



