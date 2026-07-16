import { describe, expect, it } from "vitest";
import {
  ACTIVE_BALANCE_ARTIFACT_PATHS,
  PROTECTED_HISTORICAL_BALANCE_ARTIFACT_PATHS,
  assertWritableBalanceArtifact,
  balanceArtifactRepositoryPath,
  isProtectedHistoricalBalanceArtifact,
} from "./artifact-protection.mjs";

describe("balance artifact protection", () => {
  it("blocks historical Phase 6A and Phase 6B artifact overwrites", () => {
    for (const protectedPath of PROTECTED_HISTORICAL_BALANCE_ARTIFACT_PATHS) {
      expect(() => assertWritableBalanceArtifact(`../../${protectedPath}`)).toThrow(
        new RegExp(`protected historical balance artifact: ${protectedPath}`),
      );
      expect(isProtectedHistoricalBalanceArtifact(`../../${protectedPath}`)).toBe(true);
    }
  });

  it("keeps the active implementation candidate namespace writable", () => {
    for (const activePath of ACTIVE_BALANCE_ARTIFACT_PATHS) {
      expect(() => assertWritableBalanceArtifact(`../../${activePath}`)).not.toThrow();
      expect(isProtectedHistoricalBalanceArtifact(`../../${activePath}`)).toBe(false);
    }
  });

  it("allows temporary or explicitly new balance outputs", () => {
    expect(() =>
      assertWritableBalanceArtifact("../../artifacts/balance/local-smoke-results.json"),
    ).not.toThrow();
  });

  it("normalizes artifact paths before comparing them to the protected set", () => {
    expect(
      balanceArtifactRepositoryPath(
        "../../artifacts/balance/phase-6b.2-expanded-search-space.json",
      ),
    ).toBe("artifacts/balance/phase-6b.2-expanded-search-space.json");
  });
});
