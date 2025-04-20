const { lisp2JSON } = require('./dist/lisp2json.js');

// Test the lambda expression
const result = lisp2JSON('((lambda (x) (+ x 1)) 5)');
console.log(result); 