# JavaScript Interpreter

An interpreter for a simple programming language, built in TypeScript as part of a 
Programming Languages course.

## What I Built

- **Interpreter** (`src/interpreter.ts`) — evaluates programs represented as ASTs, including:
  - Arithmetic operators: `+`, `-`, `*`, `/`
  - Comparison operators: `>`, `<`, `===`
  - Logical operators: `&&`, `||` (with short-circuit evaluation)
  - Statements: `let`, assignment, `print`, `if/else`, `while`
  - Scoped variable environments with nested scope support
- **Tests** (`src/interpreter.test.ts`) — full Jest test suite covering all of the above

## What Was Provided

- The parser (`include/parser.ts`) — converts source code into an AST
- `main.ts` — CLI entry point

## How to Run

```bash
npm install
npm run start ./include/programs/yourfile.js
```

## Concepts Demonstrated

- Tree-walking interpretation
- Lexical scoping with nested environments
- Type checking at runtime
- Short-circuit evaluation
