interface LispNode {
  cmd?: string;
  args?: LispNode[];
  lit?: any;
  type?: string;
  var?: string;
}

/**
 * Converts a Lisp expression to JSON
 * @param input The Lisp expression as a string
 * @returns The JSON representation of the Lisp expression
 */
export function lisp2JSON(input: string): string {
  // Skip lines that start with ;; (Lisp comments)
  const filteredInput = input
    .split('\n')
    .filter(line => !line.trim().startsWith(';;'))
    .join('\n');
    
  const tokens = tokenize(filteredInput);
  const nodes: LispNode[] = [];
  
  let remainingTokens = tokens;
  while (remainingTokens.length > 0) {
    const { node, remaining } = parse(remainingTokens);
    nodes.push(node);
    remainingTokens = remaining;
  }

  return JSON.stringify(nodes);
}

/**
 * Converts a JSON representation back to a Lisp expression
 * @param input The JSON representation as a string
 * @returns The Lisp expression
 */
export function json2Lisp(input: string): string {
  const nodes: LispNode[] = JSON.parse(input);
  const lispStrings = nodes.map(node => toLisp(node));
  return lispStrings.join('\n');
}

/**
 * Preprocesses function syntax in the input
 * @param input The input string
 * @returns The preprocessed string
 */
function preprocessFunctionSyntax(input: string): string {
  let result = '';
  let i = 0;
  
  while (i < input.length) {
    if (input.substring(i).startsWith("#'(")) {
      result += "(function (";
      i += 3; // Skip "#'("
      
      let parenCount = 1;
      let closingIndex = i;
      
      while (closingIndex < input.length && parenCount > 0) {
        if (input[closingIndex] === '(') {
          parenCount++;
        } else if (input[closingIndex] === ')') {
          parenCount--;
        }
        closingIndex++;
      }
      
      if (parenCount === 0) {
        result += input.substring(i, closingIndex - 1);
        result += "))";
        i = closingIndex;
      } else {
        // If we didn't find a matching closing parenthesis, just write the original syntax
        result += "#'(";
        i += 3;
      }
    } else {
      result += input[i];
      i++;
    }
  }
  
  return result;
}

/**
 * Tokenizes the input string into an array of tokens
 * @param input The input string
 * @returns An array of tokens
 */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let currentToken = '';
  let inString = false;

  // Preprocess #'( syntax
  input = preprocessFunctionSyntax(input);

  // replace all "'(" with (list ;
  input = input.replace(/'\(/g, "(list ");

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    
    if (inString) {
      currentToken += char;
      if (char === '"') {
        tokens.push(currentToken);
        currentToken = '';
        inString = false;
      }
    } else if (char === '"') {
      if (currentToken.length > 0) {
        tokens.push(currentToken);
        currentToken = '';
      }
      currentToken += char;
      inString = true;
    } else if (char === '(' || char === ')') {
      if (currentToken.length > 0) {
        tokens.push(currentToken);
        currentToken = '';
      }
      tokens.push(char);
    } else if (![' ', '\t', '\n'].includes(char)) {
      currentToken += char;
    } else if (currentToken.length > 0) {
      tokens.push(currentToken);
      currentToken = '';
    }
  }

  if (currentToken.length > 0) {
    tokens.push(currentToken);
  }

  return tokens;
}

/**
 * Parses a list of tokens into a LispNode
 * @param tokens The list of tokens
 * @returns The parsed LispNode and remaining tokens
 */
function parse(tokens: string[]): { node: LispNode; remaining: string[] } {
  if (tokens.length === 0) {
    throw new Error("Unexpected end of input");
  }

  if (tokens[0] === '(') {
    return parseList(tokens.slice(1));
  } else {
    return { node: parseLiteral(tokens[0]), remaining: tokens.slice(1) };
  }
}

/**
 * Parses a list of tokens into a LispNode
 * @param tokens The list of tokens
 * @returns The parsed LispNode and remaining tokens
 */
function parseList(tokens: string[]): { node: LispNode; remaining: string[] } {
  if (tokens.length === 0) {
    throw new Error("Unexpected end of input");
  }

  if (tokens[0] === 'let') {
    return parseLet(tokens);
  } else if (tokens[0] === 'defun') {
    return parseDefun(tokens);
  } else if (tokens[0] === 'cond') {
    return parseCond(tokens);
  }

  const args: LispNode[] = [];
  let remaining = tokens;

  while (remaining.length > 0 && remaining[0] !== ')') {
    const { node, remaining: newRemaining } = parse(remaining);
    args.push(node);
    remaining = newRemaining;
  }

  if (remaining.length === 0) {
    throw new Error("Missing closing parenthesis");
  }

  if (args.length === 0) {
    return { node: {}, remaining: remaining.slice(1) };
  }

  return { node: { cmd: args[0].var, args: args.slice(1) }, remaining: remaining.slice(1) };
}

/**
 * Parses a cond expression
 * @param tokens The list of tokens
 * @returns The parsed LispNode and remaining tokens
 */
function parseCond(tokens: string[]): { node: LispNode; remaining: string[] } {
  if (tokens.length < 2) { // "cond" and at least one clause
    throw new Error("Invalid cond expression: not enough arguments");
  }

  // Skip "cond" token
  tokens = tokens.slice(1);

  const clauses: LispNode[] = [];
  while (tokens.length > 0 && tokens[0] !== ')') {
    if (tokens[0] !== '(') {
      throw new Error("Each cond clause must be a list");
    }
    const { node, remaining } = parseCondClause(tokens.slice(1));
    clauses.push(node);
    tokens = remaining;
  }

  if (tokens.length === 0 || tokens[0] !== ')') {
    throw new Error("Missing closing parenthesis for cond expression");
  }

  return {
    node: {
      cmd: "cond",
      args: clauses
    },
    remaining: tokens.slice(1)
  };
}

/**
 * Parses a cond clause
 * @param tokens The list of tokens
 * @returns The parsed LispNode and remaining tokens
 */
function parseCondClause(tokens: string[]): { node: LispNode; remaining: string[] } {
  const clause: LispNode = { args: [] };
  
  // Parse the condition
  const { node: condition, remaining: afterCondition } = parse(tokens);
  clause.args!.push(condition);
  
  // Parse the consequent (action)
  let remaining = afterCondition;
  while (remaining.length > 0 && remaining[0] !== ')') {
    const { node, remaining: newRemaining } = parse(remaining);
    clause.args!.push(node);
    remaining = newRemaining;
  }

  if (remaining.length === 0 || remaining[0] !== ')') {
    throw new Error("Missing closing parenthesis for cond clause");
  }

  return { node: clause, remaining: remaining.slice(1) };
}

/**
 * Parses a let expression
 * @param tokens The list of tokens
 * @returns The parsed LispNode and remaining tokens
 */
function parseLet(tokens: string[]): { node: LispNode; remaining: string[] } {
  if (tokens.length < 4) { // "let", bindings, body, and closing paren
    throw new Error("Invalid let expression: not enough arguments");
  }

  // Skip "let" token
  tokens = tokens.slice(1);

  // Parse bindings
  const { node: bindingsNode, remaining: afterBindings } = parseBindings(tokens);
  
  // Parse body (everything else until the closing parenthesis)
  const body: LispNode[] = [];
  let remaining = afterBindings;
  
  while (remaining.length > 0 && remaining[0] !== ')') {
    const { node, remaining: newRemaining } = parse(remaining);
    body.push(node);
    remaining = newRemaining;
  }

  // Ensure closing parenthesis
  if (remaining.length === 0 || remaining[0] !== ')') {
    throw new Error("Missing closing parenthesis for let expression");
  }

  return {
    node: {
      cmd: "let",
      args: [bindingsNode, ...body]
    },
    remaining: remaining.slice(1)
  };
}

/**
 * Parses bindings in a let expression
 * @param tokens The list of tokens
 * @returns The parsed LispNode and remaining tokens
 */
function parseBindings(tokens: string[]): { node: LispNode; remaining: string[] } {
  if (tokens[0] !== '(') {
    throw new Error("Bindings must start with '('");
  }
  tokens = tokens.slice(1); // Skip opening parenthesis

  const bindings: LispNode[] = [];
  while (tokens.length > 0 && tokens[0] !== ')') {
    if (tokens[0] !== '(') {
      throw new Error("Each binding must be a list");
    }
    // Parse a single binding
    tokens = tokens.slice(1); // Skip opening parenthesis for the binding
    if (tokens.length < 2) {
      throw new Error("Each binding must have a variable and a value");
    }

    const varName = tokens[0]; // The variable name (e.g., 'x' or 'y')
    const { node: valueNode, remaining } = parse(tokens.slice(1)); // The value associated with the variable

    // Add the binding as a LispNode where Var is the variable and Args contains the value
    bindings.push({
      var: varName,
      args: [valueNode]
    });

    // Expect a closing parenthesis for the current binding
    if (remaining[0] !== ')') {
      throw new Error("Missing closing parenthesis for a binding");
    }
    tokens = remaining.slice(1); // Skip the closing parenthesis for the current binding
  }

  if (tokens.length === 0 || tokens[0] !== ')') {
    throw new Error("Missing closing parenthesis for bindings");
  }

  return { node: { args: bindings }, remaining: tokens.slice(1) };
}

/**
 * Parses a literal token into a LispNode
 * @param token The token to parse
 * @returns The parsed LispNode
 */
function parseLiteral(token: string): LispNode {
  if (token.startsWith('"') && token.endsWith('"')) {
    return { lit: token.slice(1, -1), type: "string" };
  } else if (!isNaN(Number(token))) {
    return { lit: token, type: "number" };
  } else {
    return { var: token };
  }
}

/**
 * Parses a defun expression
 * @param tokens The list of tokens
 * @returns The parsed LispNode and remaining tokens
 */
function parseDefun(tokens: string[]): { node: LispNode; remaining: string[] } {
  if (tokens.length < 4) {
    throw new Error("Invalid defun expression: not enough arguments");
  }

  // Skip "defun" token
  tokens = tokens.slice(1);

  // The first element is the function name
  const funcName = tokens[0];
  tokens = tokens.slice(1);

  // The second element is the argument list (which is a list of variables, not commands)
  if (tokens[0] !== '(') {
    throw new Error("Function argument list must start with '('");
  }
  const { node: argListNode, remaining: afterArgList } = parseArgList(tokens);

  // Parse the function body (everything else until the closing parenthesis)
  const body: LispNode[] = [];
  let remaining = afterArgList;
  
  while (remaining.length > 0 && remaining[0] !== ')') {
    const { node, remaining: newRemaining } = parse(remaining);
    body.push(node);
    remaining = newRemaining;
  }

  // Ensure closing parenthesis
  if (remaining.length === 0 || remaining[0] !== ')') {
    throw new Error("Missing closing parenthesis for defun expression");
  }

  return {
    node: {
      cmd: "defun",
      args: [
        { var: funcName },    // Function name
        argListNode,          // Argument list
        { args: body }        // Function body
      ]
    },
    remaining: remaining.slice(1)
  };
}

/**
 * Parses argument lists in `defun`, which consist of variables (not commands)
 * @param tokens The list of tokens
 * @returns The parsed LispNode and remaining tokens
 */
function parseArgList(tokens: string[]): { node: LispNode; remaining: string[] } {
  if (tokens[0] !== '(') {
    throw new Error("Argument list must start with '('");
  }
  tokens = tokens.slice(1); // Skip '('
  
  const args: LispNode[] = [];
  while (tokens.length > 0 && tokens[0] !== ')') {
    args.push({ var: tokens[0] }); // Treat each item as a variable
    tokens = tokens.slice(1);
  }

  if (tokens.length === 0 || tokens[0] !== ')') {
    throw new Error("Missing closing parenthesis for argument list");
  }
  
  return { node: { args }, remaining: tokens.slice(1) }; // Skip closing ')'
}

/**
 * Converts a LispNode to a Lisp expression string
 * @param node The LispNode to convert
 * @returns The Lisp expression string
 */
function toLisp(node: LispNode): string {
  // Handle variables directly
  if (node.var) {
    return node.var;
  }
  
  // Handle literals directly
  if (node.lit !== undefined) {
    if (node.type === "string") {
      return `"${node.lit}"`; // Return string literals with quotes
    }
    return `${node.lit}`; // Return other literals (like numbers)
  }

  // Handle let expressions
  if (node.cmd === "let") {
    if (!node.args || node.args.length < 2) {
      return "(let ())";  // Handle empty let
    }
    const bindings = toLispLetBindings(node.args[0]);
    const body = toLisp(node.args[1]);
    return `(let ${bindings} ${body})`;
  }

  // Handle defun expressions
  if (node.cmd === "defun") {
    if (!node.args || node.args.length < 3) {
      return `(defun ${toLisp(node.args![0])} ())`;  // Handle empty defun
    }
    const funcName = toLisp(node.args[0]);
    const params = toLisp(node.args[1]);
    const body = toLisp(node.args[2]);
    return `(defun ${funcName} (${params}) ${body})`;
  }

  // Handle function expressions (#'( ... ))
  if (node.cmd === "function") {
    if (node.args && node.args.length === 1) {
      return `#'${toLisp(node.args[0])}`;
    }
    return `#'(${toLisp(node.args![0])})`;
  }

  // Handle list expressions ('( ... ))
  if (node.cmd === "list") {
    if (!node.args) return "()";
    const args = node.args.map(arg => toLisp(arg));
    return `'(${args.join(" ")})`;
  }

  // Handle cond expressions
  if (node.cmd === "cond") {
    if (!node.args) return "(cond)";
    const clauses = node.args.map(clause => {
      if (!clause.args || clause.args.length < 2) {
        return ""; // Skip invalid clauses
      }
      const condition = toLisp(clause.args[0]);
      const consequent = clause.args.slice(1).map(arg => toLisp(arg));
      return `(${condition} ${consequent.join(" ")})`;
    }).filter(Boolean);
    return `(cond ${clauses.join(" ")})`;
  }

  // Handle function calls or expressions
  if (node.cmd) {
    if (!node.args) return `(${node.cmd})`;
    const args = node.args.map(arg => toLisp(arg));
    return `(${node.cmd} ${args.join(" ")})`;
  }
  
  // If it's a node without a command (like a list), just join the arguments
  if (!node.args) return "";
  const args = node.args.map(arg => toLisp(arg));
  return args.join(" ");
}

/**
 * Helper function to handle let bindings
 * @param node The LispNode containing the bindings
 * @returns The Lisp expression string for the bindings
 */
function toLispLetBindings(node: LispNode): string {
  if (!node.args) return "()";
  const bindings = node.args.map(arg => {
    if (arg.var && arg.args && arg.args.length > 0) {
      return `(${arg.var} ${toLisp(arg.args[0])})`;
    }
    return "";
  }).filter(Boolean);
  return `(${bindings.join(" ")})`;
} 