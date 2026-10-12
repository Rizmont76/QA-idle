// @vitest-environment node
import { expect, it } from "vitest";
import { cash, number } from "./careerUtils";
it("keeps large career amounts compact and distinguishes monetary magnitudes", () => {
  expect(cash(3e16)).toBe("$30Qa");
  expect(number(1e15)).toBe("1Qa");
  expect(number(1e18)).toBe("1Qi");
  expect(number(1e21)).toBe("1Sx");
  expect(number(2.5)).toBe("2,5");
});
