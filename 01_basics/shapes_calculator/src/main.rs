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
