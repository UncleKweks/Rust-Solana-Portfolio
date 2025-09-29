# Rust & Solana Portfolio  

![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Anchor](https://img.shields.io/badge/Anchor-3B3B98?style=for-the-badge&logo=anchor&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## Overview
This repository documents my **end-to-end journey** mastering **Rust** and **Solana program development**.

It now includes:
1. **Rust Fundamentals** → Core language features, CLI tools, basic algorithms.  
2. **Solana Programs** → On-chain programs using the **Anchor framework**.  
3. **Full DApps** → Complete decentralized applications with on-chain programs and frontends.  

The purpose is twofold:
- **Skill Development:** Build a solid foundation in systems programming with Rust and decentralized app development on Solana.  
- **Portfolio Showcase:** Present clean, tested, production-style code to prospective employers and collaborators.  

---

## Why This Portfolio?
- **Learning by building:** Each project reflects an applied concept (structs, traits, async, Solana PDAs, etc.).  
- **Progressive difficulty:** From basic Rust programs to complex Solana smart contracts and full-stack dApps.  
- **Professional standards:** Tests, modular structure, and clear READMEs.  

I aim to demonstrate:
- Competence in **Rust for backend & systems development**.  
- Ability to design, build, and test **real-world Solana programs**.  
- Commitment to **clean code practices** and **scalable DApp architecture**.  

---

## Repository Structure

```bash
rust-solana-portfolio/
│
├── 01_basics/                     # Rust fundamentals
│   ├── hello_world/               # "Hello Rust!" basics
│   └── shapes_calculator/         # Structs, traits, polymorphism
│
├── nft/                           # Verified on-chain NFT
│   ├── create-collection.ts
│   ├── create-nft.ts
│   ├── verify-nft.ts
│   └── assets/
│
├── program-UncleKweks/            # Full decentralized social platform
│   ├── anchor_project/            # On-chain Solana program
│   └── frontend/                  # React + TypeScript + Tailwind frontend
│
├── swap/                          # Simple swap program (professional structure)
│   ├── programs/swap/             # Anchor smart contract
│   ├── tests/                     # Integration tests
│   └── app/                       # Supporting code & migrations
│
└── README.md                      # You are here
```
---

# Smart Contract Developer Portfolio

## Featured Projects

### 🔹 **program-UncleKweks**
A decentralized **social platform** built on Solana.  
- On-chain profiles, posts (with optional images/tags), tipping in SOL, and follow/unfollow.  
- Enforced by the smart contract for **transparency, ownership, and censorship resistance**.  
- **Frontend:** React + TypeScript + Tailwind + Solana wallet adapters.  
- **Live Demo:** [Visit the app](https://solsocial-rd1ooep2v-unclekweks-projects.vercel.app/)  
- *(Detailed README inside this folder.)*


### 🔹 **nft**
A verified on-chain **NFT project**.
* Scripts to create a collection, mint NFTs, and verify them on Solana.

### 🔹 **swap**
A **simple token swap program** structured professionally with:
* Separate modules for instructions, state, constants, and errors.
* Anchor tests and migrations for deployment.



#### 🔹 CRUD Journal App (Solana + Anchor + React)

A decentralized **CRUD Journal App** built with **Anchor (Rust)** for the backend and **React + TypeScript + Tailwind** for the frontend.

Users can:
- Create, update, delete, and archive journal entries on-chain.
- Manage profiles (each user has a profile PDA).
- View and listen to entries via event-driven updates.
- Interact directly with the blockchain using wallet adapters (Phantom, Solflare, etc.).

---

## Features

### Backend (Anchor + Rust)
- **On-chain journal entries** with title, content, and category.
- **Soft delete support**: archive/unarchive entries without permanent removal.
- **User profiles** track metadata like total entries and activity.
- **Structured errors & events** for frontend integration.
- **Ownership checks** (`has_one = owner`) to enforce access control.

### Frontend (React + TypeScript + Tailwind)
- Wallet connection & profile initialization.
- Create, edit, delete, and archive journal entries.
- **Event-driven UI updates** (listens to Anchor program events).
- Clean, minimal design with Solana wallet integration.

---

## Client Examples (TypeScript + Anchor)

Below are snippets showing how to derive PDAs (using a title hash) and call instructions with Anchor (`program.methods...` style).

### Install
```bash
npm i @project-serum/anchor @solana/web3.js js-sha256
# or use Node crypto instead of js-sha256
```

---

## Client Examples (TypeScript + Anchor)

Below are snippets showing how to derive PDAs, call instructions, fetch accounts, and listen for events using Anchor (v0.25+ style `program.methods...`).


### 1) Derive PDAs (using sha256 for 32-byte seed)

```ts
import { PublicKey } from '@solana/web3.js';
import crypto from 'crypto'; // node
// or: import { sha256 } from 'js-sha256' // browser

function titleHash(title: string): Buffer {
  return crypto.createHash('sha256').update(title).digest(); // 32 bytes
}

    async function derivePdas(programId: PublicKey, ownerPubkey: PublicKey, title: string) {
    const tHash = titleHash(title);
  const [journalPda, journalBump] = await PublicKey.findProgramAddress(
    [tHash, ownerPubkey.toBuffer()],
    programId
  );

  const [profilePda, profileBump] = await PublicKey.findProgramAddress(
    [Buffer.from('profile'), ownerPubkey.toBuffer()],
    programId
  );

  return { journalPda, journalBump, profilePda, profileBump };
}
```
---

### 2) Create a Journal Entry
```ts
    const title = "My First Note";
    const content = "Hello on-chain world!";
    const category = "personal";

    const { journalPda, profilePda } = await derivePdas(program.programId, wallet.publicKey, title);

    await program.methods
  .createJournalEntry(title, content, category)
  .accounts({
    owner: wallet.publicKey,
    journalEntry: journalPda,
    userProfile: profilePda,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();

```

### 3) Fetch a Journal Account
```ts
    const journal = await program.account.journalEntryState.fetch(journalPda);
    console.log("Owner:", journal.owner.toBase58());
    console.log("Title:", journal.title);

```
### 4) Listen for Events

```ts
    const listener = program.addEventListener('JournalEntryCreated', (event, slot) => {
    console.log("Entry created:", event);
});

// later remove
    await program.removeEventListener(listener);

```

### 5) List a User’s Entries
```ts
    const filters = [{ memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } }];
    const accounts = await connection.getProgramAccounts(program.programId, { filters });

    for (const { pubkey, account } of accounts) {
  // decode account.data with Anchor IDL or borsh
}

```
---

### Frontend — Run Locally

```bash
cd crud-journal/frontend
yarn install
yarn start     # or: npm run start

```
---

### Example .env
```env
REACT_APP_CLUSTER=devnet
REACT_APP_RPC=https://api.devnet.solana.com
REACT_APP_PROGRAM_ID=933zmSGvoLgSaxNVCJURuXTSx4j1t4kdJbELGTxoX1u9

```

---

### Wallet Adapters

#### Frontend uses:

- @solana/wallet-adapter-react

- @solana/wallet-adapter-wallets

- @project-serum/anchor


#### Flows:

1. Connect wallet.

2. Initialize user profile (if not already).

3. Create / edit / archive / delete entries.

4. Listen for program events and update UI.

### Testing & Local Development
#### Localnet
```bash
solana-test-validator --reset
anchor build
export ANCHOR_PROVIDER_URL=http://127.0.0.1:8899
anchor deploy
anchor test
```

### Devnet
```bash
anchor build
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
anchor deploy --provider.cluster devnet
```
> ⚠️ Ensure declare_id!() in Rust matches the program ID in Anchor.toml and the frontend .env.

### License

- MIT

## How to Run

### Rust Projects

```bash
cd 01_basics/shapes_calculator
cargo run
cargo test
```

### Solana Programs

```bash
cd swap
anchor build
anchor deploy
anchor test
```

**Prerequisites:**
* Rust
* Solana CLI
* Anchor

## Key Concepts Learned

Each project README explains:
* **What the project does**
* **Rust/Solana concepts applied**
* **Lessons learned**

This builds a clear **narrative of growth** from beginner to advanced.

## About Me

I am a **smart contract developer and security researcher**, passionate about **secure, high-performance systems**.

This portfolio reflects my approach: **learn deeply, build progressively, and document professionally**.

**I am open to frontend, smart contracts, Rust, or Solidity blockchain-focused opportunities.**

📧 **Email:** [Kwesiliokafor25@gmail.com](mailto:Kwesiliokafor25@gmail.com)
