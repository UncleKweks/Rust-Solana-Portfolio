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

📧 **Email:** [Kwesiliokafor7@gmail.com](mailto:Kwesiliokafor7@gmail.com)
