.PHONY: build test clean

build:
	@echo "Building lisp2json..."
	@go build -o bin/lisp2json cmd/lisp2json/main.go

test: build
	@echo "Running tests..."
	@./test.sh

clean:
	@echo "Cleaning up..."
	@rm -rf bin

all: clean build test