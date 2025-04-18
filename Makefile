.PHONY: build test clean ts-build ts-test ts-clean all

build:
	@echo "Building lisp2json (Go)..."
	@go build -o bin/lisp2json cmd/lisp2json/main.go

test: build
	@echo "Running Go tests..."
	@./test.sh

clean:
	@echo "Cleaning up Go build..."
	@rm -rf bin

ts-build:
	@echo "Building lisp2json (TypeScript)..."
	@npm run build

ts-test: ts-build
	@echo "Running TypeScript tests..."
	@./testts.sh

ts-clean:
	@echo "Cleaning up TypeScript build..."
	@npm run clean

all: clean ts-clean build ts-build test ts-test