#!/bin/bash

set -e

# Build the TypeScript project
npm run build

START=1
END=13

# if there is an argument, START=END=$1 
if [ $# -gt 0 ]; then
    START=$1
    END=$1
fi

# Run tests for each example
for i in $(seq $START $END); do
   
    echo "Testing example$i.lsp"
    
    # Convert Lisp to JSON
    node dist/cli.js --lisp examples/example$i.lsp > /tmp/example$i.json
    
    # Convert JSON back to Lisp
    node dist/cli.js --json /tmp/example$i.json > /tmp/example$i.lisp
    
    echo 
    echo "Original:"
    cat examples/example$i.lsp
    echo
    echo 
    echo "Converted to JSON:"
    cat /tmp/example$i.json
    echo 
    echo "Converted to Lisp:"
    cat /tmp/example$i.lisp

    echo 
done

# Clean up temporary files
rm -f /tmp/example*.json /tmp/example*.lisp 