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
./bin/lisp2json --lisp example.lsp

# Convert JSON file to Lisp
./bin/lisp2json --json example.json
```

## 🧪 Running Tests

To run the tests, use the following command:

```bash
make test
```

Example run:

```
Building lisp2json...
Testing example1.lsp

Original:
(print "Hello, World!")

Converted to JSON:
[{"cmd":"print","args":[{"lit":"Hello, World!","type":"string"}]}]

Converted to Lisp:
(print "Hello, World!")

Testing example2.lsp

Original:
(+ (* 3 4) (- 10 5))

Converted to JSON:
[{"cmd":"+","args":[{"cmd":"*","args":[{"lit":"3","type":"number"},{"lit":"4","type":"number"}]},{"cmd":"-","args":[{"lit":"10","type":"number"},{"lit":"5","type":"number"}]}]}]

Converted to Lisp:
(+ (* 3 4) (- 10 5))

Testing example3.lsp

Original:
(if (> 5 3)
    (print "Five is greater than three")
    (print "This won't be printed"))

(if t
    (print "Five is greater than three")
    (print "This won't be printed"))

Converted to JSON:
[{"cmd":"if","args":[{"cmd":"\u003e","args":[{"lit":"5","type":"number"},{"lit":"3","type":"number"}]},{"cmd":"print","args":[{"lit":"Five is greater than three","type":"string"}]},{"cmd":"print","args":[{"lit":"This won't be printed","type":"string"}]}]},{"cmd":"if","args":[{"var":"t"},{"cmd":"print","args":[{"lit":"Five is greater than three","type":"string"}]},{"cmd":"print","args":[{"lit":"This won't be printed","type":"string"}]}]}]

Converted to Lisp:
(if (> 5 3) (print "Five is greater than three") (print "This won't be printed"))
(if t (print "Five is greater than three") (print "This won't be printed"))

Testing example4.lsp

Original:
(defun square (x)
    (* x x))
(square 5)

(defun mult2 (a b)
  (* a b))

(defun mult3 (a b c)
  (* a b c))

(print (mult2 3 4))
(print (mult3 2 3 4))

(print (mult2 5.5 2))
(print (mult3 -1 3 -2))

Converted to JSON:
[{"cmd":"defun","args":[{"var":"square"},{"args":[{"var":"x"}]},{"args":[{"cmd":"*","args":[{"var":"x"},{"var":"x"}]}]}]},{"cmd":"square","args":[{"lit":"5","type":"number"}]},{"cmd":"defun","args":[{"var":"mult2"},{"args":[{"var":"a"},{"var":"b"}]},{"args":[{"cmd":"*","args":[{"var":"a"},{"var":"b"}]}]}]},{"cmd":"defun","args":[{"var":"mult3"},{"args":[{"var":"a"},{"var":"b"},{"var":"c"}]},{"args":[{"cmd":"*","args":[{"var":"a"},{"var":"b"},{"var":"c"}]}]}]},{"cmd":"print","args":[{"cmd":"mult2","args":[{"lit":"3","type":"number"},{"lit":"4","type":"number"}]}]},{"cmd":"print","args":[{"cmd":"mult3","args":[{"lit":"2","type":"number"},{"lit":"3","type":"number"},{"lit":"4","type":"number"}]}]},{"cmd":"print","args":[{"cmd":"mult2","args":[{"lit":"5.5","type":"number"},{"lit":"2","type":"number"}]}]},{"cmd":"print","args":[{"cmd":"mult3","args":[{"lit":"-1","type":"number"},{"lit":"3","type":"number"},{"lit":"-2","type":"number"}]}]}]

Converted to Lisp:
(defun square (x) (* x x))
(square 5)
(defun mult2 (a b) (* a b))
(defun mult3 (a b c) (* a b c))
(print (mult2 3 4))
(print (mult3 2 3 4))
(print (mult2 5.5 2))
(print (mult3 -1 3 -2))

Testing example5.lsp

Original:
(cons 1 (cons 2 (cons 3 nil)))


Converted to JSON:
[{"cmd":"cons","args":[{"lit":"1","type":"number"},{"cmd":"cons","args":[{"lit":"2","type":"number"},{"cmd":"cons","args":[{"lit":"3","type":"number"},{"var":"nil"}]}]}]}]

Converted to Lisp:
(cons 1 (cons 2 (cons 3 nil)))

Testing example6.lsp

Original:
(defun factorial (n)
    (if (<= n 1)
        1
        (* n (factorial (- n 1)))))
(factorial 5)

Converted to JSON:
[{"cmd":"defun","args":[{"var":"factorial"},{"args":[{"var":"n"}]},{"args":[{"cmd":"if","args":[{"cmd":"\u003c=","args":[{"var":"n"},{"lit":"1","type":"number"}]},{"lit":"1","type":"number"},{"cmd":"*","args":[{"var":"n"},{"cmd":"factorial","args":[{"cmd":"-","args":[{"var":"n"},{"lit":"1","type":"number"}]}]}]}]}]}]},{"cmd":"factorial","args":[{"lit":"5","type":"number"}]}]

Converted to Lisp:
(defun factorial (n) (if (<= n 1) 1 (* n (factorial (- n 1)))))
(factorial 5)

Testing example7.lsp

Original:
(mapcar #'(lambda (x) (* x 2)) '(1 2 3 4 5))


Converted to JSON:
[{"cmd":"mapcar","args":[{"cmd":"function","args":[{"cmd":"lambda","args":[{"cmd":"x"},{"cmd":"*","args":[{"var":"x"},{"lit":"2","type":"number"}]}]}]},{"cmd":"list","args":[{"lit":"1","type":"number"},{"lit":"2","type":"number"},{"lit":"3","type":"number"},{"lit":"4","type":"number"},{"lit":"5","type":"number"}]}]}]

Converted to Lisp:
(mapcar #'(lambda (x ) (* x 2)) '(1 2 3 4 5))

Testing example8.lsp

Original:
(let ((x 5)
      (y 3))
  (+ x y))

Converted to JSON:
[{"cmd":"let","args":[{"args":[{"args":[{"lit":"5","type":"number"}],"var":"x"},{"args":[{"lit":"3","type":"number"}],"var":"y"}]},{"cmd":"+","args":[{"var":"x"},{"var":"y"}]}]}]

Converted to Lisp:
(let ((x 5) (y 3)) (+ x y))

Testing example9.lsp

Original:
(cond ((> x 10) (print "x is greater than 10"))
      ((< x 0) (print "x is negative"))
      (t (print "x is between 0 and 10")))


Converted to JSON:
[{"cmd":"cond","args":[{"args":[{"cmd":"\u003e","args":[{"var":"x"},{"lit":"10","type":"number"}]},{"cmd":"print","args":[{"lit":"x is greater than 10","type":"string"}]}]},{"args":[{"cmd":"\u003c","args":[{"var":"x"},{"lit":"0","type":"number"}]},{"cmd":"print","args":[{"lit":"x is negative","type":"string"}]}]},{"args":[{"var":"t"},{"cmd":"print","args":[{"lit":"x is between 0 and 10","type":"string"}]}]}]}]

Converted to Lisp:
(cond ((> x 10) (print "x is greater than 10")) ((< x 0) (print "x is negative")) (t (print "x is between 0 and 10")))

Testing example10.lsp

Original:
(let ((person '((name . "Alice") (age . 30) (city . "New York"))))
  (assoc 'age person))

Converted to JSON:
[{"cmd":"let","args":[{"args":[{"args":[{"cmd":"list","args":[{"cmd":"name","args":[{"var":"."},{"lit":"Alice","type":"string"}]},{"cmd":"age","args":[{"var":"."},{"lit":"30","type":"number"}]},{"cmd":"city","args":[{"var":"."},{"lit":"New York","type":"string"}]}]}],"var":"person"}]},{"cmd":"assoc","args":[{"var":"'age"},{"var":"person"}]}]}]

Converted to Lisp:
(let ((person '((name . "Alice") (age . 30) (city . "New York")))) (assoc 'age person))

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
