use std::io::{self, Write};

fn main() {
    print!("Hello, Rust! What's your name? ");
    io::stdout().flush().unwrap(); // Make sure the prompt shows immediately

    let mut name = String::new();
    io::stdin()
        .read_line(&mut name)
        .expect("Failed to read line");

    let name = name.trim();
    println!("{}", greet_user(name));
}

/// Separate logic for greeting (easier to test)
fn greet_user(name: &str) -> String {
    format!("Nice to meet you, {}!", name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet_user() {
        let greeting = greet_user("Kwesili");
        assert_eq!(greeting, "Nice to meet you, Kwesili!");
    }
}
