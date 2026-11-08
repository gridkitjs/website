import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatShadow, parseDimension, parseShadow } from "./values.ts";

describe("parseDimension", () => {
  test("reads a number and its unit, keeping the number's spelling", () => {
    assert.deepEqual(parseDimension("0.25rem"), {
      amount: "0.25",
      unit: "rem",
    });
    assert.deepEqual(parseDimension(".5EM"), { amount: ".5", unit: "em" });
    assert.deepEqual(parseDimension("-1px"), { amount: "-1", unit: "px" });
    assert.deepEqual(parseDimension("0"), { amount: "0", unit: "" });
    assert.deepEqual(parseDimension("600"), { amount: "600", unit: "" });
  });

  test("refuses anything but one number", () => {
    for (const value of [
      "calc(var(--gridkit-spacing) * 2)",
      "inherit",
      "1px 2px",
      "",
    ]) {
      assert.equal(parseDimension(value), undefined, value);
    }
  });
});

describe("parseShadow", () => {
  test("reads two to four pixel lengths", () => {
    assert.deepEqual(parseShadow("0 4px 12px"), {
      x: "0",
      y: "4",
      blur: "12",
      spread: "0",
    });
    assert.deepEqual(parseShadow("1px 2px 3px -1px"), {
      x: "1",
      y: "2",
      blur: "3",
      spread: "-1",
    });
  });

  test("refuses other units, colours and expressions", () => {
    for (const value of ["0 0.25rem 1rem", "0 4px 12px black", "4px", "none"]) {
      assert.equal(parseShadow(value), undefined, value);
    }
  });

  test("writes the geometry back as it reads it", () => {
    for (const value of ["0 4px 12px", "0 10px 30px", "1px 2px 3px -1px"]) {
      const shadow = parseShadow(value);
      assert.ok(shadow);
      assert.equal(formatShadow(shadow), value);
    }
  });
});
