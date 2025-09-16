import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter
} from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

const endpoint = "https://api.devnet.solana.com";

// Create wallet adapters with Windows-compatible configuration
const wallets = [
  new PhantomWalletAdapter({
    appIdentity: {
      name: "Solana Social",
      uri: window.location.origin,
      icon: window.location.origin + "/favicon.ico"
    }
  }),
  new SolflareWalletAdapter(),
  new TorusWalletAdapter()
];

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);
