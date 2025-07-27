# Hello World (Rust Edition)

![Rust Version](https://img.shields.io/badge/Rust-1.70%2B-orange)
![Build Status](https://github.com/yourusername/rust-solana-portfolio/actions/workflows/rust.yml/badge.svg)

## Overview
A simple **Rust "Hello World" program** with a twist — it **takes user input** and responds dynamically.  
This is my first step in building Rust projects for this portfolio.

---

## Concepts Learned
- **Cargo project structure:** `Cargo.toml` and `src/main.rs`.
- **Printing output:** Using `println!()`.
- **Reading user input:** With `std::io::stdin()`.
- **String manipulation:** Using `.trim()` to remove whitespace/newlines.
- **Error handling:** `.expect()` for basic input handling.

---

## Project Structure
```

hello\_world/
├── Cargo.toml      # Project metadata
└── src/
└── main.rs     # Program entry point

````

---

## How to Run
```bash
cd 01_basics/hello_world
cargo run
````

**Example Output:**

```
Hello, Rust! What's your name?
Kwesili
Nice to meet you, Kwesili!
```

---
