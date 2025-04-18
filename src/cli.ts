#!/usr/bin/env node

import { lisp2JSON, json2Lisp } from './lisp2json';
import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const jsonFile = args.find(arg => arg === '--json') ? args[args.indexOf('--json') + 1] : '';
const lispFile = args.find(arg => arg === '--lisp') ? args[args.indexOf('--lisp') + 1] : '';

if (jsonFile) {
  try {
    const content = fs.readFileSync(jsonFile, 'utf8');
    const result = json2Lisp(content);
    console.log(result);
  } catch (error) {
    console.error(`Error converting JSON to Lisp: ${error}`);
    process.exit(1);
  }
} else if (lispFile) {
  try {
    const content = fs.readFileSync(lispFile, 'utf8');
    const result = lisp2JSON(content);
    console.log(result);
  } catch (error) {
    console.error(`Error converting Lisp to JSON: ${error}`);
    process.exit(1);
  }
} else {
  console.error('Please specify either --json or --lisp flag');
  console.error('Usage: lisp2json-ts --json <file> | --lisp <file>');
  process.exit(1);
} 