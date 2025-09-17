export const defaultCodeSnippets: Record<string, string> = {
    'C++ (GCC 14.1.0)': `#include <iostream>
  using namespace std;
  
  int main() {
      cout << "Hello, C++!" << endl;
      return 0;
  }`,
    'C (GCC 11.2.0)': `#include <stdio.h>
  
  int main() {
      printf("Hello, C!\\n");
      return 0;
  }`,
    'Python (3.11.2)': `print("Hello, Python!")`,
    'JavaScript (Node.js 20.1.0)': 'console.log("Hello, JavaScript!");',
    'Java (OpenJDK 17.0.2)': `public class Main {
      public static void main(String[] args) {
          System.out.println("Hello, Java!");
      }
  }`,
    'Go (1.20.1)': `package main
  
  import "fmt"
  
  func main() {
      fmt.Println("Hello, Go!")
  }`,
    'Rust (1.85.0)': `fn main() {
      println!("Hello, Rust!");
  }`
  };