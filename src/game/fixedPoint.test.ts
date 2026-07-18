import { describe, expect, it } from "vitest";
import { FixedPoint } from "./fixedPoint";

describe("FixedPoint", () => {
  it("parses decimal and scientific notation at the requested scale", () => {
    expect(FixedPoint.fromNumber(1.25, 6).toNumber()).toBe(1.25);
    expect(FixedPoint.fromNumber(1e-5, 6).toNumber()).toBe(0.00001);
    expect(FixedPoint.fromNumber(1e9, 6).toNumber()).toBe(1e9);
  });

  it("rounds halfway values away from zero", () => {
    expect(FixedPoint.fromNumber(0.0000005, 6).toNumber()).toBe(0.000001);
    expect(FixedPoint.fromNumber(-0.0000005, 6).toNumber()).toBe(-0.000001);
  });

  it("performs scaled addition and multiplication", () => {
    const left = FixedPoint.fromNumber(1.4, 6);
    const right = FixedPoint.fromNumber(1.3, 6);

    expect(left.add(FixedPoint.fromNumber(0.22, 6)).toNumber()).toBe(1.62);
    expect(left.multiply(right).toNumber()).toBe(1.82);
  });

  it("rejects non-finite values and mixed scales", () => {
    expect(() => FixedPoint.fromNumber(Number.NaN, 6)).toThrow(
      "Fixed-point values must be finite.",
    );
    expect(() => FixedPoint.fromNumber(1, 6).add(FixedPoint.fromNumber(1, 3))).toThrow(
      "Cannot mix fixed-point scales.",
    );
  });
});
