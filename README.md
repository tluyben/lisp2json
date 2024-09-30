# 🔄 lisp2json

Convert Lisp to JSON and back with ease! 🚀

## 📖 Overview

`lisp2json` is a Go library and CLI tool that allows you to convert Lisp expressions to JSON and vice versa. It's perfect for developers working with Lisp who need to interface with JSON-based systems or APIs.

## ✨ Features

- 🔀 Convert Lisp to JSON
- 🔁 Convert JSON to Lisp
- 🖥️ Command-line interface
- 📚 Reusable Go library

## 🛠️ Installation

```bash
go get github.com/tluyben/lisp2json
```

## 🚀 Usage

### As a library

```go
import "github.com/tluyben/lisp2json"

// Convert Lisp to JSON
jsonStr, err := lisp2json.Lisp2JSON("(print \"Hello, World!\")")

// Convert JSON to Lisp
lispStr, err := lisp2json.JSON2Lisp("{\"cmd\":\"print\",\"args\":[{\"lit\":\"Hello, World!\",\"type\":\"string\"}]}")
```

### As a CLI tool

```bash
# Convert Lisp file to JSON
lisp2json --lisp example.lsp

# Convert JSON file to Lisp
lisp2json --json example.json
```

## 🧪 Running Tests

To run the tests, use the following command:

```bash
make test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/tluyben/lisp2json/issues).

## 👨‍💻 Author

**Your Name**

- GitHub: [@tluyben](https://github.com/tluyben)

## 🌟 Show your support

Give a ⭐️ if this project helped you!
