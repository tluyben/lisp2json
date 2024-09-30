#!/bin/bash

set -e

# Build the CLI tool
make build

# Run tests for each example
for i in {1..10}
do
    echo "Testing example$i.lsp"
    
    # Convert Lisp to JSON
    ./bin/lisp2json --lisp examples/example$i.lsp > /tmp/example$i.json
    
    # Convert JSON back to Lisp
    ./bin/lisp2json --json /tmp/example$i.json > /tmp/example$i.lisp
    
    echo 
    echo "Original:"
    cat examples/example$i.lsp
    echo 
    echo 
    echo "Converted to JSON:"
    cat /tmp/example$i.json
    echo 
    echo 
    echo "Converted to Lisp:"
    cat /tmp/example$i.lisp

    echo 
done

# Clean up temporary files
rm -f /tmp/example*.json /tmp/example*.lisp

echo "All tests passed successfully!"