import { upgrades } from "../gameData";
import type {
  GameState,
  ResourceTransactionValidationFailure,
  Upgrade,
  UpgradePurchaseValidationFailure,
  UpgradePurchaseValidationFailureCode,
  UpgradePurchaseValidationResult,
} from "../types";
import { validateResourceTransaction } from "./resources";

export function getUpgradeCost(upgrade: Upgrade) {
  return upgrade.cost.amount;
}

export function getVisibleUpgradeDefinitions(
  game: GameState,
  upgradeDefinitions: readonly Upgrade[] = upgrades,
) {
  return upgradeDefinitions
    .filter(
      (upgrade) =>
        upgrade.visibility === "active" && game.uiSurfaces[upgrade.group] === "active",
    )
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function buildUpgradePurchaseFailure(
  code: UpgradePurchaseValidationFailureCode,
  upgradeId: string,
  message: string,
): UpgradePurchaseValidationFailure {
  return {
    code,
    upgradeId,
    message,
  };
}

function mapResourceFailureToUpgradePurchaseFailure(
  upgradeId: string,
  failure: ResourceTransactionValidationFailure,
): UpgradePurchaseValidationFailure {
  switch (failure.code) {
    case "resource_not_found":
      return buildUpgradePurchaseFailure("resource_missing", upgradeId, failure.message);
    case "balance_below_minimum":
      return buildUpgradePurchaseFailure("not_affordable", upgradeId, failure.message);
    default:
      return buildUpgradePurchaseFailure(
        "transaction_failed",
        upgradeId,
        failure.message,
      );
  }
}

export function validateUpgradePurchase(
  game: GameState,
  upgradeId: string,
  upgradeDefinitions: readonly Upgrade[] = upgrades,
): UpgradePurchaseValidationResult {
  const upgrade = upgradeDefinitions.find((item) => item.id === upgradeId);

  if (!upgrade) {
    return {
      ok: false,
      failures: [
        buildUpgradePurchaseFailure(
          "definition_not_found",
          upgradeId,
          `Unknown upgrade: ${upgradeId}.`,
        ),
      ],
    };
  }

  const visibleUpgrades = getVisibleUpgradeDefinitions(game, upgradeDefinitions);

  if (!visibleUpgrades.some((visibleUpgrade) => visibleUpgrade.id === upgrade.id)) {
    return {
      ok: false,
      failures: [
        buildUpgradePurchaseFailure(
          "not_visible",
          upgrade.id,
          `${upgrade.name} is not visible.`,
        ),
      ],
    };
  }

  if ((game.upgrades[upgrade.id] ?? 0) >= upgrade.maxLevel) {
    return {
      ok: false,
      failures: [
        buildUpgradePurchaseFailure(
          "already_owned",
          upgrade.id,
          `${upgrade.name} is already owned.`,
        ),
      ],
    };
  }

  const resolvedCost = {
    resourceId: upgrade.cost.resourceId,
    amount: getUpgradeCost(upgrade),
  };
  const affordability = validateResourceTransaction(game.resources, {
    operationType: "spend",
    changes: [{ resourceId: resolvedCost.resourceId, delta: -resolvedCost.amount }],
  });

  if (!affordability.ok) {
    return {
      ok: false,
      failures: affordability.failures.map((failure) =>
        mapResourceFailureToUpgradePurchaseFailure(upgrade.id, failure),
      ),
    };
  }

  return {
    ok: true,
    upgrade,
    resolvedCost,
    effects: upgrade.effects,
  };
}
