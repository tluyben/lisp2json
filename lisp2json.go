package lisp2json

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

type LispNode struct {
	Cmd  string      `json:"cmd,omitempty"`
	Args []LispNode  `json:"args,omitempty"`
	Lit  interface{} `json:"lit,omitempty"`
	Type string      `json:"type,omitempty"`
	Var  string      `json:"var,omitempty"`
}


func Lisp2JSON(input string) (string, error) {
	tokens := tokenize(input)
	var nodes []LispNode
	for len(tokens) > 0 {
		ast, remainingTokens, err := parse(tokens)
		if err != nil {
			return "", err
		}
		nodes = append(nodes, ast)
		tokens = remainingTokens
	}

	jsonBytes, err := json.Marshal(nodes)
	if err != nil {
		return "", err
	}
	return string(jsonBytes), nil
}

func tokenize(input string) []string {
	var tokens []string
	var currentToken strings.Builder
	inString := false

	// lazy but works; 
	// replace all "'(" with (list ; 
	input = strings.ReplaceAll(input, "'(", "(list ")

	for _, char := range input {
		if inString {
			currentToken.WriteRune(char)
			if char == '"' {
				tokens = append(tokens, currentToken.String())
				currentToken.Reset()
				inString = false
			}
		} else if char == '"' {
			if currentToken.Len() > 0 {
				tokens = append(tokens, currentToken.String())
				currentToken.Reset()
			}
			currentToken.WriteRune(char)
			inString = true
		} else if char == '(' || char == ')' {
			if currentToken.Len() > 0 {
				tokens = append(tokens, currentToken.String())
				currentToken.Reset()
			}
			tokens = append(tokens, string(char))
		} else if !strings.ContainsRune(" \t\n", char) {
			currentToken.WriteRune(char)
		} else if currentToken.Len() > 0 {
			tokens = append(tokens, currentToken.String())
			currentToken.Reset()
		}
	}

	if currentToken.Len() > 0 {
		tokens = append(tokens, currentToken.String())
	}

	return tokens
}

func parse(tokens []string) (LispNode, []string, error) {
	if len(tokens) == 0 {
		return LispNode{}, tokens, fmt.Errorf("unexpected end of input")
	}

	if tokens[0] == "(" {
		return parseList(tokens[1:])
	} else {
		return parseLiteral(tokens[0]), tokens[1:], nil
	}
}

func parseList(tokens []string) (LispNode, []string, error) {
	if len(tokens) == 0 {
		return LispNode{}, tokens, fmt.Errorf("unexpected end of input")
	}

	if tokens[0] == "let" {
		return parseLet(tokens)
	} else if tokens[0] == "defun" {
		return parseDefun(tokens)
	}

	var args []LispNode
	remaining := tokens

	for len(remaining) > 0 && remaining[0] != ")" {
		arg, newRemaining, err := parse(remaining)
		if err != nil {
			return LispNode{}, tokens, err
		}
		args = append(args, arg)
		remaining = newRemaining
	}

	if len(remaining) == 0 {
		return LispNode{}, tokens, fmt.Errorf("missing closing parenthesis")
	}

	if len(args) == 0 {
		return LispNode{}, remaining[1:], nil
	}

	return LispNode{Cmd: args[0].Var, Args: args[1:]}, remaining[1:], nil
}


func parseLet(tokens []string) (LispNode, []string, error) {
	if len(tokens) < 4 { // "let", bindings, body, and closing paren
		return LispNode{}, tokens, fmt.Errorf("invalid let expression: not enough arguments")
	}

	// Skip "let" token
	tokens = tokens[1:]

	// Parse bindings
	bindingsNode, remaining, err := parseBindings(tokens)
	if err != nil {
		return LispNode{}, tokens, fmt.Errorf("error parsing let bindings: %v", err)
	}

	// Parse body (everything else until the closing parenthesis)
	var body []LispNode
	for len(remaining) > 0 && remaining[0] != ")" {
		expr, newRemaining, err := parse(remaining)
		if err != nil {
			return LispNode{}, tokens, fmt.Errorf("error parsing let body: %v", err)
		}
		body = append(body, expr)
		remaining = newRemaining
	}

	// Ensure closing parenthesis
	if len(remaining) == 0 || remaining[0] != ")" {
		return LispNode{}, tokens, fmt.Errorf("missing closing parenthesis for let expression")
	}

	return LispNode{
		Cmd:  "let",
		Args: append([]LispNode{bindingsNode}, body...),
	}, remaining[1:], nil
}

func parseBindings(tokens []string) (LispNode, []string, error) {
	if tokens[0] != "(" {
		return LispNode{}, tokens, fmt.Errorf("bindings must start with '('")
	}
	tokens = tokens[1:] // Skip opening parenthesis

	var bindings []LispNode
	for len(tokens) > 0 && tokens[0] != ")" {
		if tokens[0] != "(" {
			return LispNode{}, tokens, fmt.Errorf("each binding must be a list")
		}
		// Parse a single binding
		tokens = tokens[1:] // Skip opening parenthesis for the binding
		if len(tokens) < 2 {
			return LispNode{}, tokens, fmt.Errorf("each binding must have a variable and a value")
		}

		varName := tokens[0]           // The variable name (e.g., 'x' or 'y')
		valueNode, remaining, err := parse(tokens[1:]) // The value associated with the variable
		if err != nil {
			return LispNode{}, tokens, err
		}

		// Add the binding as a LispNode where Var is the variable and Args contains the value
		bindings = append(bindings, LispNode{
			Var:  varName,
			Args: []LispNode{valueNode},
		})

		// Expect a closing parenthesis for the current binding
		if remaining[0] != ")" {
			return LispNode{}, tokens, fmt.Errorf("missing closing parenthesis for a binding")
		}
		tokens = remaining[1:] // Skip the closing parenthesis for the current binding
	}

	if len(tokens) == 0 || tokens[0] != ")" {
		return LispNode{}, tokens, fmt.Errorf("missing closing parenthesis for bindings")
	}

	return LispNode{Args: bindings}, tokens[1:], nil
}
func parseLiteral(token string) LispNode {
	if strings.HasPrefix(token, "\"") && strings.HasSuffix(token, "\"") {
		return LispNode{Lit: token[1 : len(token)-1], Type: "string"}
	} else if _, err := strconv.ParseFloat(token, 64); err == nil {
		return LispNode{Lit: token, Type: "number"}
	} else {
		return LispNode{Var: token}
	}
}

func parseDefun(tokens []string) (LispNode, []string, error) {
	if len(tokens) < 4 {
		return LispNode{}, tokens, fmt.Errorf("invalid defun expression: not enough arguments")
	}

	// Skip "defun" token
	tokens = tokens[1:]

	// The first element is the function name
	funcName := tokens[0]
	tokens = tokens[1:]

	// The second element is the argument list (which is a list of variables, not commands)
	if tokens[0] != "(" {
		return LispNode{}, tokens, fmt.Errorf("function argument list must start with '('")
	}
	argListNode, remaining, err := parseArgList(tokens)
	if err != nil {
		return LispNode{}, tokens, err
	}

	// Parse the function body (everything else until the closing parenthesis)
	var body []LispNode
	for len(remaining) > 0 && remaining[0] != ")" {
		expr, newRemaining, err := parse(remaining)
		if err != nil {
			return LispNode{}, tokens, err
		}
		body = append(body, expr)
		remaining = newRemaining
	}

	// Ensure closing parenthesis
	if len(remaining) == 0 || remaining[0] != ")" {
		return LispNode{}, tokens, fmt.Errorf("missing closing parenthesis for defun expression")
	}

	return LispNode{
		Cmd: "defun",
		Args: []LispNode{
			{Var: funcName},    // Function name
			argListNode,        // Argument list
			{Args: body}, // Function body
		},
	}, remaining[1:], nil
}

// Parse argument lists in `defun`, which consist of variables (not commands)
func parseArgList(tokens []string) (LispNode, []string, error) {
	if tokens[0] != "(" {
		return LispNode{}, tokens, fmt.Errorf("argument list must start with '('")
	}
	tokens = tokens[1:] // Skip '('
	
	var args []LispNode
	for len(tokens) > 0 && tokens[0] != ")" {
		args = append(args, LispNode{Var: tokens[0]}) // Treat each item as a variable
		tokens = tokens[1:]
	}

	if len(tokens) == 0 || tokens[0] != ")" {
		return LispNode{}, tokens, fmt.Errorf("missing closing parenthesis for argument list")
	}
	
	return LispNode{Args: args}, tokens[1:], nil // Skip closing ')'
}



func (n LispNode) toLisp() string {
	// Handle variables directly
	if n.Var != "" {
		return n.Var
	}
	
	// Handle literals directly
	if n.Lit != nil {
		if n.Type == "string" {
			return fmt.Sprintf("\"%v\"", n.Lit) // Return string literals with quotes
		}
		return fmt.Sprintf("%v", n.Lit) // Return other literals (like numbers)
	}
	
	// Process the arguments for the current node
	args := make([]string, len(n.Args))
	for i, arg := range n.Args {
		args[i] = arg.toLisp() // Recursively convert arguments
	}
	
	// Handle list expressions ('( ... ))
	if n.Cmd == "list" {
		return fmt.Sprintf("'(%s)", strings.Join(args, " "))
	}

	// Handle function calls or expressions
	if n.Cmd != "" {
		// Join command and its arguments with no extra spaces
		if len(args) == 0 {
			return fmt.Sprintf("(%s)", n.Cmd)
		} else {
			return fmt.Sprintf("(%s %s)", n.Cmd, strings.Join(args, " "))
		}
	}
	
	// If it's a node without a command (like a list), just join the arguments
	return fmt.Sprintf("(%s)", strings.Join(args, " "))
}

func JSON2Lisp(input string) (string, error) {
	var nodes []LispNode
	err := json.Unmarshal([]byte(input), &nodes)
	if err != nil {
		return "", err
	}

	var lispStrings []string
	for _, node := range nodes {
		lispStrings = append(lispStrings, node.toLisp())
	}

	return strings.Join(lispStrings, "\n"), nil
}

