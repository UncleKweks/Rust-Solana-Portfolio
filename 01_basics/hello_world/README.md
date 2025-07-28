# Shapes Calculator

![Rust Version](https://img.shields.io/badge/Rust-1.70%2B-orange)
![Build Status](https://github.com/yourusername/rust-solana-portfolio/actions/workflows/rust.yml/badge.svg)

## Overview
An **interactive CLI tool** that calculates the **area** and **perimeter** of two shapes:  
- **Circle**
- **Rectangle**

It demonstrates:
- **Traits & Structs**: Defining reusable behavior for different shape types.
- **Pattern Matching**: Handling user choice dynamically.
- **Input Validation**: Ensuring valid numeric input.
- **Testing**: Verifying area & perimeter calculations.

---

## Concepts Learned
- Implementing a **Rust trait** for multiple structs.
- Using **match** for branching on user input.
- Creating **helper functions** for reusable input parsing.
- Writing **unit tests** for mathematical functions.
- Formatting floating‑point output with `"{:.2}"`.

---

## Project Structure
```
shapes_calculator/
├── Cargo.toml
└── src/
    └── main.rs
```

---

## How to Run
```bash
cd 01_basics/shapes_calculator
cargo run
```

### Example Output:
```
Shapes Calculator
Choose a shape:
1) Circle
2) Rectangle
1
Enter the radius:
5
Area: 78.54
Perimeter: 31.42
```

---

## How to Test
```bash
cargo test
```

