import { gameplayStatDefinitions } from "../gameData";
import { MVP_IDS } from "../types";
import type {
  DerivedStats,
  GameState,
  GameplayStatCalculationMap,
  GameplayStatCalculationResult,
  GameplayStatDefinition,
  GameplayStatId,
  GameplayStatModifierBreakdownItem,
  ModifierDefinition,
  ModifierRegistryState,
} from "../types";
import { createActiveModifierRegistry, getUpgradeModifierDefinitions } from "./modifiers";

const FLAT_MODIFIER_TYPE_ORDER = 0;
const MULTIPLICATIVE_MODIFIER_TYPE_ORDER = 1;
const OVERRIDE_MODIFIER_TYPE_ORDER = 2;
const UNSUPPORTED_MODIFIER_TYPE_ORDER = 3;

function getModifierTypeOrder(modifierType: ModifierDefinition["modifierType"]): number {
  switch (modifierType) {
    case "flat":
      return FLAT_MODIFIER_TYPE_ORDER;
    case "multiplicative":
      return MULTIPLICATIVE_MODIFIER_TYPE_ORDER;
    case "override":
      return OVERRIDE_MODIFIER_TYPE_ORDER;
    default:
      return UNSUPPORTED_MODIFIER_TYPE_ORDER;
  }
}

function getGameplayStatDefinition(
  statId: GameplayStatId,
  definitions: readonly GameplayStatDefinition[] = gameplayStatDefinitions,
): GameplayStatDefinition {
  const stat = definitions.find((definition) => definition.id === statId);

  if (!stat) {
    throw new Error(`Unknown gameplay stat: ${statId}.`);
  }

  return stat;
}

export function calculateGameplayStat(
  statId: GameplayStatId,
  registry: ModifierRegistryState,
  modifierDefinitions: readonly ModifierDefinition[] = getUpgradeModifierDefinitions(),
  statDefinitions: readonly GameplayStatDefinition[] = gameplayStatDefinitions,
): GameplayStatCalculationResult {
  const stat = getGameplayStatDefinition(statId, statDefinitions);
  const definitionById = new Map(
    modifierDefinitions.map((definition) => [definition.definitionId, definition]),
  );
  const activeModifiers = Object.values(registry)
    .filter((instance) => instance.enabled)
    .map((instance) => {
      const definition = definitionById.get(instance.definitionId);

      if (definition?.targetStatId !== statId) {
        return null;
      }

      return { instance, definition };
    })
    .filter(
      (
        modifier,
      ): modifier is {
        instance: NonNullable<typeof modifier>["instance"];
        definition: ModifierDefinition;
      } => modifier !== null,
    )
    .sort((left, right) => {
      const leftOrder = getModifierTypeOrder(left.definition.modifierType);
      const rightOrder = getModifierTypeOrder(right.definition.modifierType);
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      const byDefinition = left.definition.definitionId.localeCompare(
        right.definition.definitionId,
      );

      if (byDefinition !== 0) {
        return byDefinition;
      }

      return left.instance.instanceId.localeCompare(right.instance.instanceId);
    });

  const calculation = activeModifiers.reduce<{
    value: number;
    appliedModifiers: GameplayStatModifierBreakdownItem[];
  }>(
    (current, { instance, definition }) => {
      if (
        definition.modifierType !== "flat" &&
        definition.modifierType !== "multiplicative" &&
        definition.modifierType !== "override"
      ) {
        return current;
      }

      const unboundedValue =
        definition.modifierType === "flat"
          ? current.value + definition.value
          : definition.modifierType === "multiplicative"
            ? current.value * definition.value
            : definition.value;
      const nextValue = Math.max(stat.minimumValue, unboundedValue);

      return {
        value: nextValue,
        appliedModifiers: [
          ...current.appliedModifiers,
          {
            instanceId: instance.instanceId,
            definitionId: definition.definitionId,
            sourceType: definition.sourceType,
            sourceId: definition.sourceId,
            modifierType: definition.modifierType,
            value: definition.value,
            previousValue: current.value,
            newValue: nextValue,
          },
        ],
      };
    },
    {
      value: Math.max(stat.minimumValue, stat.baseValue),
      appliedModifiers: [],
    },
  );

  return {
    statId,
    value: calculation.value,
    breakdown: {
      statId,
      baseValue: stat.baseValue,
      appliedModifiers: calculation.appliedModifiers,
      finalValue: calculation.value,
    },
  };
}

export function calculateGameplayStats(
  game: GameState,
  statDefinitions: readonly GameplayStatDefinition[] = gameplayStatDefinitions,
): GameplayStatCalculationMap {
  const { registry } = createActiveModifierRegistry(game);

  return statDefinitions.reduce(
    (calculatedStats, stat) => ({
      ...calculatedStats,
      [stat.id]: calculateGameplayStat(
        stat.id,
        registry,
        getUpgradeModifierDefinitions(),
        statDefinitions,
      ),
    }),
    {} as GameplayStatCalculationMap,
  );
}

export function getDerivedStats(game: GameState): DerivedStats {
  const stats = calculateGameplayStats(game);

  return {
    bugsPerClick: stats[MVP_IDS.gameplayStats.manualBugsPerAction].value,
    moneyPerBug: stats[MVP_IDS.gameplayStats.moneyPerBugReported].value,
  };
}
