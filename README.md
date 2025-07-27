# Rust & Solana Portfolio

## Overview
This repository documents my **end-to-end journey** mastering **Rust** and **Solana program development**.  

It progresses from:
1. **Rust Fundamentals** → Core language features, CLI tools, basic algorithms.
2. **Intermediate Rust** → Practical CLI apps, APIs, concurrency, file handling, and crypto utilities.
3. **Solana Programs** → On-chain programs using the **Anchor framework** (SPL tokens, counters, voting DApps, escrow systems).

The purpose is twofold:
- **Skill Development:** Build a solid foundation in systems programming with Rust and decentralized app development on Solana.
- **Portfolio Showcase:** Present clean, tested, production-style code to prospective employers and collaborators.

---

## Why This Portfolio?
- **Learning by building:** Each project reflects an applied concept (structs, traits, async, Solana PDAs, etc.).
- **Progressive difficulty:** From basic Rust programs to complex Solana smart contracts.
- **Professional code standards:** Tests, CI pipelines, and detailed documentation.

I aim to demonstrate:
- Competence in **Rust for backend & systems development**.
- Ability to design, build, and test **real-world Solana programs**.
- Commitment to **clean code practices** (modular design, clear READMEs, automation).

---

## Repository Structure

```

rust-solana-portfolio/
│
├── 01\_basics/                  # Rust fundamentals
│   ├── hello\_world/            # "Hello Rust!" + basics
│   ├── shapes\_calculator/      # Structs, traits, polymorphism
│   ├── temperature\_converter/  # CLI with user input parsing
│   └── guess\_number/           # Randomness, loops, error handling
│
├── 02\_intermediate\_rust/       # CLI tools & web apps
│   ├── cli\_todo/               # File-based to-do manager
│   ├── file\_encryptor/         # Basic cryptography & I/O
│   ├── rest\_api/               # Web API with Axum or Actix
│   └── multi\_threaded\_downloader/ # Async + concurrency
│
├── 03\_solana\_programs/         # Solana programs (Anchor)
│   ├── hello\_solana/           # "Hello World" on-chain
│   ├── token\_mint/             # Custom SPL token
│   ├── counter\_program/        # Persistent PDA-based counter
│   ├── voting\_dapp/            # DAO-style voting
│   └── escrow/                 # Simple escrow contract
│
└── README.md                   # You are here

````

---

## How to Run

### Rust Projects
```bash
cd 01_basics/shapes_calculator
cargo run
cargo test
````

### Solana Projects

```bash
cd 03_solana_programs/hello_solana
anchor build
anchor deploy
anchor test
```

**Prerequisites:**

* [Rust](https://rustup.rs/)
* [Solana CLI](https://docs.solana.com/cli/install-solana-cli)
* [Anchor](https://book.anchor-lang.com/chapter_2/installation.html)

---

## Continuous Integration

Every push to `main` triggers:

* **Rust CI:** Builds and tests all Rust projects.
* **Solana CI:** Builds and tests Anchor programs against a local Solana validator.

---

## Key Concepts Learned

Each project’s README explains:

* **What the project does**
* **Rust/Solana concepts applied**
* **Lessons learned**

This creates a **narrative of growth** from beginner to advanced.

---

## About Me

I am a **smart contract developer and security researcher**, passionate about **secure, high-performance systems**.

This portfolio reflects my approach: **learn deeply, build progressively, and document professionally**.

> **I am open to backend, smart contract, or blockchain-focused opportunities.** 
> -  **Email:** [Kwesiliokafor7@gmail.com])
> - **LinkedIn:** [https://www.linkedin.com/in/chimkwesili-okafor-50440616b/]
