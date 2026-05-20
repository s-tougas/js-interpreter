import { Expression, IfStatement, Statement, WhileStatement } from "../include/parser.js";

type RuntimeValue = number | boolean;
  
export function interpProgram(program: Statement[]): State {
  const globalScope = new State();
  // Add your implementation
  for (const statement of program) {
    interpStatement(globalScope, statement);
  }
  return globalScope;
}

export function interpStatement(state: State, stmt: Statement): void {
  switch (stmt.kind) {
    case "let":
      state.declare(stmt.name, interpExpression(state, stmt.expression));
      break;
    case "assignment":
      state.set(stmt.name, interpExpression(state, stmt.expression));
      break;
    case "print":
      console.log(interpExpression(state, stmt.expression));
      break;
    case "if":
      interpIfStatement(state, stmt);
      break;
    case "while":
      interpWhileStatement(state, stmt);
      break;
    default:
      throw new Error("Unknown statement kind");
  }
}

function interpIfStatement(state: State, stmt: IfStatement) {
  const evaluate = interpExpression(state, stmt.test);
  if (typeof evaluate !== "boolean") throw new Error("Condition must be a boolean");
  if (evaluate) interpBlock(state, stmt.truePart);
  else interpBlock(state, stmt.falsePart);
}

function interpWhileStatement(state: State, stmt: WhileStatement) {
  let condition = interpExpression(state, stmt.test);
  if (typeof condition !== "boolean") throw new Error("Condition must be a boolean");
  while (condition) {
    interpBlock(state, stmt.body);
    condition = interpExpression(state, stmt.test);
    if (typeof condition !== "boolean") throw new Error("Condition must be a boolean");
  }
}

function interpBlock(state: State, statements: Statement[]) {
  const local_state: State = new State(state);
  for (const statement of statements) {
    interpStatement(local_state, statement);
  }
}

export function interpExpression(state: State, expr: Expression): RuntimeValue {
  switch (expr.kind) {
    case "boolean":
      return expr.value;
    case "number":
      return expr.value;
    case "variable":
      return state.get(expr.name);
    case "operator":
      if (expr.operator === "&&") {
        const left = interpExpression(state, expr.left);
        if (typeof left !== "boolean") throw new Error("Logical operations must be boolean");
        if (!left) return false;
        const right = interpExpression(state, expr.right);
        if (typeof right !== "boolean") throw new Error("Logical operations must be boolean");
        return right;
      }
      if (expr.operator === "||") {
        const left = interpExpression(state, expr.left);
        if (typeof left !== "boolean") throw new Error("Logical operations must be boolean");
        if (left) return true;
        const right = interpExpression(state, expr.right);
        if (typeof right !== "boolean") throw new Error("Logical operations must be boolean");
        return right;
      }
      const left = interpExpression(state, expr.left);
      const right = interpExpression(state, expr.right);
      switch (expr.operator) {
        case "+":
          if (typeof left !== "number" || typeof right !== "number")
            throw new Error("Arithmetic may only happen between numbers");
          return left + right;
        case "-":
          if (typeof left !== "number" || typeof right !== "number")
            throw new Error("Arithmetic may only happen between numbers");
          return left - right;
        case "*":
          if (typeof left !== "number" || typeof right !== "number")
            throw new Error("Arithmetic may only happen between numbers");
          return left * right;
        case "/":
          if (typeof left !== "number" || typeof right !== "number")
            throw new Error("Arithmetic may only happen between numbers");
          if (right === 0) throw new Error("Cannot divide by 0");
          return left / right;
        case ">":
          if (typeof left !== "number" || typeof right !== "number")
            throw new Error("Comparison may only happen between numbers");
          return left > right;
        case "<":
          if (typeof left !== "number" || typeof right !== "number")
            throw new Error("Comparison may only happen between numbers");
          return left < right;
        case "===":
          return left === right;
        default:
          throw new Error("Unknown Operator type");
      }
    default:
      throw new Error("Unknown Expression type");
  }
}


export class State {

  private vars = new Map<string, RuntimeValue>();
  
  private parent: State | undefined = undefined;

  constructor(parent: State | undefined = undefined) {
    this.parent = parent;
  }

  // Declares a variable with the given name and binds
  // the given value to it in the local scope.
  // Throws an error if the name already exists in the innermost scope.
  declare(name: string, value: RuntimeValue) {
    if (this.vars.has(name)) throw new Error("Variable already exists in scope");
    else {
      this.vars.set(name, value);
    }
  }

  // Returns the value bound to the given name in the current environment.
  // The "environment" is the current collection of nested scopes.
  // First searches the innermost scope, then checks each parent scope
  // sequentially until the name is found.
  // Throws an error if the name cannot be found.
  get(name: string): RuntimeValue {
    if (this.vars.has(name)) {
      return this.vars.get(name) as RuntimeValue;
    } else if (this.parent) {
      return this.parent.get(name);
    } else {
      throw new Error("Name could not be found");
    }
  }

  // Updates the value bound to the given name in the current environment.
  // First searches the innermost scope, then checks each parent scope
  // sequentially until the name is found.
  // Throws an error if the name cannot be found.
  set(name: string, value: RuntimeValue) {
    if (this.vars.has(name)) {
      this.vars.set(name, value);
    } else {
      if (this.parent) {
        this.parent.set(name, value);
      } else {
        throw new Error("Name cannot be found");
      }
    }
  }

 
  asObject() {
    return Object.fromEntries(this.vars.entries());
  }
}
