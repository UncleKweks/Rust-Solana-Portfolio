Perfect — let’s make this a **real portfolio‑worthy beginner project**:  
- Traits + structs (**Circle** & **Rectangle**)  
- **Interactive CLI** (asks for shape & dimensions)  
- **Unit tests** (verifying calculations)  
- Clean **README**  

---

## **Code: `src/main.rs`**
```rust
use std::io;

/// Trait for geometric shapes
trait Shape {
    fn area(&self) -> f64;
    fn perimeter(&self) -> f64;
}

/// Circle struct
struct Circle {
    radius: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius.powi(2)
    }

    fn perimeter(&self) -> f64 {
        2.0 * std::f64::consts::PI * self.radius
    }
}

/// Rectangle struct
struct Rectangle {
    width: f64,
    height: f64,
}

impl Shape for Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn perimeter(&self) -> f64 {
        2.0 * (self.width + self.height)
    }
}

/// Helper function to read a floating‑point number from stdin
fn read_number(prompt: &str) -> f64 {
    loop {
        println!("{}", prompt);
        let mut input = String::new();
        io::stdin().read_line(&mut input).expect("Failed to read input");
        match input.trim().parse::<f64>() {
            Ok(num) if num > 0.0 => return num,
            _ => println!("Please enter a valid positive number."),
        }
    }
}

fn main() {
    println!("Shapes Calculator");
    println!("Choose a shape: \n1) Circle \n2) Rectangle");

    let mut choice = String::new();
    io::stdin().read_line(&mut choice).expect("Failed to read input");

    match choice.trim() {
        "1" => {
            let radius = read_number("Enter the radius:");
            let circle = Circle { radius };
            println!("Area: {:.2}", circle.area());
            println!("Perimeter: {:.2}", circle.perimeter());
        }
        "2" => {
            let width = read_number("Enter the width:");
            let height = read_number("Enter the height:");
            let rectangle = Rectangle { width, height };
            println!("Area: {:.2}", rectangle.area());
            println!("Perimeter: {:.2}", rectangle.perimeter());
        }
        _ => println!("Invalid choice. Exiting."),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_circle_calculations() {
        let circle = Circle { radius: 5.0 };
        assert!((circle.area() - 78.5398).abs() < 0.001);
        assert!((circle.perimeter() - 31.4159).abs() < 0.001);
    }

    #[test]
    fn test_rectangle_calculations() {
        let rect = Rectangle { width: 4.0, height: 6.0 };
        assert_eq!(rect.area(), 24.0);
        assert_eq!(rect.perimeter(), 20.0);
    }
}
```

---

## **README.md**

```markdown
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

---

## Next Improvements
- Add **Triangle** and **Square** support.
- Switch to **command‑line arguments** (`clap` crate) for faster input.
- Export results to **JSON** for logging or API use.

---

*This project is part of the [Rust & Solana Portfolio](../../README.md).*
```

---

### **What we achieved here:**
- Professional‑grade beginner project (**structs, traits, tests**).  
- **Reusable design** (adding new shapes is easy).  
- **Clean error‑handled input** (no silent panics).  
- **Tests** make this look like production‑level code.

---

**Next question:**  

Do you want me to **refactor this now** to **also support CLI arguments** (e.g., `cargo run -- circle 5`)?  

That would make it look like a real command‑line utility and prepare us for later tools (using `clap`).  

Or should we **keep moving to the next beginner project** (`temperature_converter`)?  

Which do you prefer? **Add CLI args now** or **move to the next project**?