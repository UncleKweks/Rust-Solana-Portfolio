import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface DebugPanelProps {
  isVisible: boolean;
}

export default function DebugPanel({ isVisible }: DebugPanelProps) {
  const { publicKey, connected, connecting, disconnecting } = useWallet();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [localStorageStatus, setLocalStorageStatus] = useState<string>('Unknown');

  useEffect(() => {
    if (!isVisible) return;

    const updateDebugInfo = () => {
      const info = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        walletState: {
          connected,
          connecting,
          disconnecting,
          publicKey: publicKey?.toBase58() || 'none'
        },
        localStorage: {
          available: typeof localStorage !== 'undefined',
          quota: 'N/A'
        },
        window: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          location: window.location.href
        },
        errors: []
      };

      // Check localStorage availability
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('debug_test', 'test');
          localStorage.removeItem('debug_test');
          setLocalStorageStatus('Available');
        } else {
          setLocalStorageStatus('Not Available');
        }
      } catch (err) {
        setLocalStorageStatus(`Error: ${err}`);
        info.localStorage.available = false;
      }

      // Check for console errors
      const originalError = console.error;
      const originalWarn = console.warn;
      const errors: string[] = [];
      
      console.error = (...args) => {
        errors.push(args.join(' '));
        originalError.apply(console, args);
      };
      
      console.warn = (...args) => {
        errors.push(`WARN: ${args.join(' ')}`);
        originalWarn.apply(console, args);
      };

      // Reset after a short delay
      setTimeout(() => {
        console.error = originalError;
        console.warn = originalWarn;
        info.errors = errors;
        setDebugInfo(info);
      }, 100);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 5000);
    
    return () => clearInterval(interval);
  }, [isVisible, connected, connecting, disconnecting, publicKey]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md text-xs font-mono overflow-auto max-h-96">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Panel</h3>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700"
        >
          Reload
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Wallet:</strong> {connected ? 'Connected' : 'Disconnected'}
        </div>
        <div>
          <strong>Public Key:</strong> {publicKey?.toBase58().slice(0, 8)}...
        </div>
        <div>
          <strong>localStorage:</strong> {localStorageStatus}
        </div>
        <div>
          <strong>Window:</strong> {window.innerWidth}x{window.innerHeight}
        </div>
        <div>
          <strong>URL:</strong> {window.location.href}
        </div>
        
        {debugInfo.errors && debugInfo.errors.length > 0 && (
          <div>
            <strong>Recent Errors:</strong>
            <div className="mt-1 space-y-1">
              {debugInfo.errors.slice(-3).map((error: string, index: number) => (
                <div key={index} className="text-red-400 text-xs">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <details className="mt-2">
          <summary className="cursor-pointer text-blue-400">Full Debug Info</summary>
          <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
