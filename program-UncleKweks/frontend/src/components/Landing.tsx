import React from "react";
import { Wallet } from "lucide-react";

type Props = { onConnect: () => void };

export default function Landing({ onConnect }: Props) {
    const isWindows = navigator.platform.includes('Win');
    
    const handleConnect = () => {
        console.log("Connect button clicked");
        try {
            onConnect();
        } catch (error) {
            console.error("Error in onConnect:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-white/10">
                <Wallet className="h-14 w-14 text-white/90" />
            </div>
            <h1 className="text-6xl font-bold mb-4">Solana Social</h1>
            <p className="text-xl mb-8 opacity-90">
                Share thoughts, tip creators, build community on Solana
            </p>
            
            {isWindows && (
                <div className="mb-6 p-4 bg-yellow-500/20 rounded-lg max-w-md">
                    <p className="text-yellow-200 text-sm">
                        <strong>Windows Users:</strong> Make sure you have Phantom or Solflare wallet installed and enabled in your browser.
                    </p>
                </div>
            )}
            
            <button
                onClick={handleConnect}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
                Connect Wallet
            </button>
            
            {isWindows && (
                <div className="mt-4 text-xs text-white/70 max-w-md">
                    <p>If connection fails, try refreshing the page or check browser console for errors.</p>
                </div>
            )}
        </div>
    );
}



