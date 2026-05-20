import assert from "assert";

// * Use `npm run build:parser` and import
import { parse } from "./peggyParser.js";

// * or rebuild parser each execution
// import fs from "fs";
// import peggy from "peggy";
// const grammar = fs.readFileSync("./include/grammar.pegjs", "utf-8");
// const parser = peggy.generate(grammar);
// const parse = (s: string) => parser.parse(s);

export type BinaryOperator = "+" | "-" | "*" | "/" | "&&" | "||" | ">" | "<" | "===";

export type Expression =
  | BooleanExpression
  | NumberExpression
  | VariableExpression
  | BinaryOperatorExpression
  // Optional: You do not need to support the below expressions
  | FunctionExpression
  | CallExpression;
  
export type BooleanExpression = { kind: "boolean"; value: boolean };
export type NumberExpression = { kind: "number"; value: number };
export type BinaryOperatorExpression = { kind: "operator"; operator: BinaryOperator; left: Expression; right: Expression };
export type VariableExpression = { kind: "variable"; name: string };
export type FunctionExpression = { kind: "function"; parameters: string[]; body: Statement[] };
export type CallExpression = { kind: "call"; callee: string; arguments: Expression[] };

export type Statement =
  | LetStatement
  | AssignmentStatement
  | IfStatement
  | WhileStatement
  | PrintStatement
  // Optional: You do not need to support the below statements
  | ExpressionStatement
  | ReturnStatement;

export type LetStatement = { kind: "let"; name: string; expression: Expression };
export type AssignmentStatement = { kind: "assignment"; name: string; expression: Expression };
export type IfStatement = { kind: "if"; test: Expression; truePart: Statement[]; falsePart: Statement[] };
export type WhileStatement = { kind: "while"; test: Expression; body: Statement[] };
export type PrintStatement = { kind: "print"; expression: Expression };
export type ExpressionStatement = { kind: "expression"; expression: Expression };
export type ReturnStatement = { kind: "return"; expression: Expression };

export function parseExpression(expression: string): Expression {
  const result = parse(`${expression};`) as Statement[];
  assert(result.length === 1, "Parse result had more than one statement. Only provide expressions.");
  const expressionAST = result[0];
  assert(
    expressionAST.kind === "expression",
    "Parse result was not an expression statement. Only provide expression constructs."
  );

  return expressionAST.expression;
}

export function parseProgram(program: string): Statement[] {
  return parse(program) as Statement[];
}
