import { gameplayStatDefinitions, upgrades } from "../gameData";
import type {
  GameState,
  ModifierDefinition,
  ModifierInstanceId,
  ModifierRegistrationFailure,
  ModifierRegistryState,
  Upgrade,
} from "../types";

export function getUpgradeModifierDefinitions(
  upgradeDefinitions: readonly Upgrade[] = upgrades,
): ModifierDefinition[] {
  return upgradeDefinitions.flatMap((upgrade) =>
    upgrade.effects.map((effect) => effect.modifier),
  );
}

export function getPermanentModifierInstanceId(
  modifier: ModifierDefinition,
): ModifierInstanceId {
  return `instance.${modifier.definitionId}`;
}

function validateModifierDefinition(
  modifier: ModifierDefinition,
): ModifierRegistrationFailure[] {
  const failures: ModifierRegistrationFailure[] = [];

  if (modifier.sourceType !== "upgrade") {
    failures.push({
      code: "unsupported_modifier_source",
      definitionId: modifier.definitionId,
      message: `Unsupported modifier source: ${modifier.sourceType}.`,
    });
  }

  if (
    modifier.sourceType === "upgrade" &&
    !upgrades.some((upgrade) => upgrade.id === modifier.sourceId)
  ) {
    failures.push({
      code: "unsupported_modifier_source",
      definitionId: modifier.definitionId,
      message: `Unknown modifier upgrade source: ${modifier.sourceId}.`,
    });
  }

  if (!gameplayStatDefinitions.some((stat) => stat.id === modifier.targetStatId)) {
    failures.push({
      code: "unknown_modifier_target",
      definitionId: modifier.definitionId,
      message: `Unknown modifier target: ${modifier.targetStatId}.`,
    });
  }

  if (modifier.modifierType !== "flat") {
    failures.push({
      code: "unsupported_modifier_type",
      definitionId: modifier.definitionId,
      message: `Unsupported MVP modifier type: ${modifier.modifierType}.`,
    });
  }

  if (modifier.durationType !== "permanent") {
    failures.push({
      code: "unsupported_modifier_duration",
      definitionId: modifier.definitionId,
      message: `Unsupported MVP modifier duration: ${modifier.durationType}.`,
    });
  }

  if (modifier.stackingPolicy !== "ignore") {
    failures.push({
      code: "unsupported_modifier_stacking",
      definitionId: modifier.definitionId,
      message: `Unsupported MVP modifier stacking policy: ${modifier.stackingPolicy}.`,
    });
  }

  return failures;
}

export function createActiveModifierRegistry(
  game: GameState,
  modifierDefinitions: readonly ModifierDefinition[] = getUpgradeModifierDefinitions(),
): {
  registry: ModifierRegistryState;
  failures: readonly ModifierRegistrationFailure[];
} {
  const failures: ModifierRegistrationFailure[] = [];
  const registry = modifierDefinitions.reduce<ModifierRegistryState>(
    (activeModifiers, modifier) => {
      const validationFailures = validateModifierDefinition(modifier);

      if (validationFailures.length > 0) {
        failures.push(...validationFailures);
        return activeModifiers;
      }

      if (game.upgrades[modifier.sourceId as Upgrade["id"]] < 1) {
        return activeModifiers;
      }

      const instanceId = getPermanentModifierInstanceId(modifier);

      return {
        ...activeModifiers,
        [instanceId]: {
          instanceId,
          definitionId: modifier.definitionId,
          enabled: true,
        },
      };
    },
    {},
  );

  return { registry, failures };
}
