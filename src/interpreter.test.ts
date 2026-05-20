//import assert from "assert";
import { parseExpression, parseProgram } from "../include/parser.js";
import { State, interpExpression, interpProgram, interpStatement } from "./interpreter.js";

type RuntimeValue = number | boolean;

function expectStateToBe(program: string, state: { [key: string]: RuntimeValue }) {
  expect(interpProgram(parseProgram(program)).asObject()).toEqual(state);
}

describe("interpExpression", () => {
  it("evaluates a number", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("5"))).toBe(5);
  });

  it("evaluates a boolean", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("false"))).toBe(false);
    expect(interpExpression(state, parseExpression("true"))).toBe(true);
  });

  it("evaluates a variable", () => {
    const state = new State();
    state.declare("x", 10);
    expect(interpExpression(state, parseExpression("x"))).toBe(10);
  });

  it("throws on undeclared variable", () => {
    const state = new State();
    expect(() => interpExpression(state, parseExpression("x"))).toThrow();
  });

  it("evaluates addition(+)", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("5 + 10"))).toBe(15);
    expect(() => interpExpression(state, parseExpression("5 + true"))).toThrow();
    expect(() => interpExpression(state, parseExpression("false + true"))).toThrow();
    expect(() => interpExpression(state, parseExpression("true + 5"))).toThrow();
  });

  it("evaluates subtraction (-)", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("5 - 10"))).toBe(-5);
    expect(() => interpExpression(state, parseExpression("6 - true"))).toThrow();
    expect(() => interpExpression(state, parseExpression("true - 6"))).toThrow();
    expect(() => interpExpression(state, parseExpression("false - true"))).toThrow();
  });

  it("evaluates multiplication (*)", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("5 * 10"))).toBe(50);
    expect(() => interpExpression(state, parseExpression("6 * true"))).toThrow();
    expect(() => interpExpression(state, parseExpression("true * 6"))).toThrow();
    expect(() => interpExpression(state, parseExpression("false * true"))).toThrow();
  });

  it("evaluates division (/)", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("50 / 10"))).toBe(5);
    expect(() => interpExpression(state, parseExpression("6 / true"))).toThrow();
    expect(() => interpExpression(state, parseExpression("true / 6"))).toThrow();
    expect(() => interpExpression(state, parseExpression("false / true"))).toThrow();
    expect(() => interpExpression(state, parseExpression("5 / 0"))).toThrow();
  });

  it("evaluates greater than (>)", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("50 > 10"))).toBe(true);
    expect(interpExpression(state, parseExpression("5 > 10"))).toBe(false);
    expect(() => interpExpression(state, parseExpression("6 > true"))).toThrow();
    expect(() => interpExpression(state, parseExpression("true > 6"))).toThrow();
    expect(() => interpExpression(state, parseExpression("false > true"))).toThrow();
  });

  it("evaluates less than (<)", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("50 < 10"))).toBe(false);
    expect(interpExpression(state, parseExpression("5 < 10"))).toBe(true);
    expect(() => interpExpression(state, parseExpression("6 < true"))).toThrow();
    expect(() => interpExpression(state, parseExpression("true < 6"))).toThrow();
    expect(() => interpExpression(state, parseExpression("false < true"))).toThrow();
  });

  it("evaluates equality (===)", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("50 === 10"))).toBe(false);
    expect(interpExpression(state, parseExpression("50 === 50"))).toBe(true);
    expect(interpExpression(state, parseExpression("true === true"))).toBe(true);
  });

  it("evaluates &&", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("true && true"))).toBe(true);
    expect(interpExpression(state, parseExpression("false && true"))).toBe(false);
    expect(interpExpression(state, parseExpression("false && false"))).toBe(false);
    expect(interpExpression(state, parseExpression("true && false"))).toBe(false);
    expect(() => interpExpression(state, parseExpression("6 && true"))).toThrow();
    expect(() => interpExpression(state, parseExpression("true && 7"))).toThrow();
    expect(() => interpExpression(state, parseExpression("6 && 8"))).toThrow();
  });

  it("short circuits &&", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("false && x"))).toBe(false);
  });

  it("evaluates logical ||", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("true || true"))).toBe(true);
    expect(interpExpression(state, parseExpression("false || true"))).toBe(true);
    expect(interpExpression(state, parseExpression("false || false"))).toBe(false);
    expect(interpExpression(state, parseExpression("true || false"))).toBe(true);
    expect(() => interpExpression(state, parseExpression("6 || true"))).toThrow();
    expect(() => interpExpression(state, parseExpression("6 || 8"))).toThrow();
  });

  it("short circuits ||", () => {
    const state = new State();
    expect(interpExpression(state, parseExpression("true || x"))).toBe(true);
  });
});

describe("interpStatement", () => {
  // Tests for interpStatement go here.
  it("let, variable declaration", () => {
    const state = new State();
    interpStatement(state, parseProgram("let x =5;")[0]);
    expect(state.asObject()).toEqual({ x: 5 });
  });
  it("Throws and error for duplicate variable declarations", () => {
    expect(() => interpProgram(parseProgram("let x =5; let x = 10;"))).toThrow();
  });
  it("throws on assignment to undeclared variable", () => {
    expect(() => interpProgram(parseProgram("x = 1;"))).toThrow();
  });

  it("updates a variable with assignment", () => {
    expectStateToBe("let x = 5; x = 10;", { x: 10 });
  });
  it("prints value", () => {
    const use = jest.spyOn(global.console, "log");
    interpProgram(parseProgram("print(5);"));
    expect(use.mock.calls).toEqual([[5]]);
    use.mockRestore();
  });
  it("prints a variable value", () => {
    const use = jest.spyOn(global.console, "log");
    interpProgram(parseProgram("let x = 42; print(x);"));
    expect(use.mock.calls).toEqual([[42]]);
    use.mockRestore();
  });
  it("True branch runs when condition is true", () => {
    expectStateToBe("let x =5; if (true) { x= 10;} else{ x =20;}", { x: 10 });
  });
  it("If false, runs through false branch", () => {
    expectStateToBe("let x =5; if (false) { x= 10;} else{ x= 20;}", { x: 20 });
  });
  it("Throws an error when if statement condition is not a boolean", () => {
    expect(() => interpProgram(parseProgram("let x =5; if (6) { x= 10;} else{ x= 20;}"))).toThrow();
  });
  it("Throws an error when while loop condition is not a boolean", () => {
    expect(() => interpProgram(parseProgram("let x = 5; while (6) { x = x + 1; }"))).toThrow();
  });
  it("Loops the correct number of times", () => {
    expectStateToBe("let x = 0; while (x < 5) { x = x + 1; }", { x: 5 });
  });
  it("If the initial condition is false the loop will immediately terminate", () => {
    expectStateToBe("let x = 0; while (false) { x = x + 1; }", { x: 0 });
  });
});
describe("interpProgram", () => {
  // Tests for interpProgram go here
  it("handles a single declaration", () => {
    expectStateToBe("let japan = 52;", { japan: 52 });
  });
  it("Can manage multple declarations", () => {
    expectStateToBe("let croatia = 5; let japan = 17; let moscow = 12;", { croatia: 5, japan: 17, moscow: 12 });
  });
  it("handles reassignment", () => {
    expectStateToBe("let j =5; j =7;", { j: 7 });
  });
  it("variable stay in set scope", () => {
    expectStateToBe("let j =6; if (true) {let i = 1; } else { }", { j: 6 });
  });
  it("can reassign outer variable from inner scope", () => {
    expectStateToBe("let j = 5; if (true) { j = 10; } else { }", { j: 10 });
  });

  it("returns empty state for empty program", () => {
    expectStateToBe("", {});
  });
  it("cannot access variable declared in block after it exits", () => {
    expect(() => interpProgram(parseProgram("if (true) { let x = 5; } else { } x = 10;"))).toThrow();
  });
});
