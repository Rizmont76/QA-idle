import { uiSurfaceDefinitions } from "../gameData";
import { MVP_IDS } from "../types";
import type {
  GameState,
  UiSurfaceDefinition,
  UiSurfaceId,
  UiVisibilitySelectors,
  UnlockId,
} from "../types";

export function getUnlockState(game: GameState, unlockId: UnlockId) {
  return game.unlocks[unlockId];
}

export function getUiSurfaceState(game: GameState, surfaceId: UiSurfaceId) {
  return game.uiSurfaces[surfaceId];
}

export function getControlledUiSurface(unlockId: string | undefined) {
  return uiSurfaceDefinitions.find(
    (surface) => surface.controlledByUnlockId === unlockId,
  );
}

export function isUiSurfaceActive(game: GameState, surfaceId: UiSurfaceId) {
  return getUiSurfaceState(game, surfaceId) === "active";
}

function getActiveMvpSurfaces(
  game: GameState,
  predicate: (surface: UiSurfaceDefinition) => boolean,
) {
  return uiSurfaceDefinitions
    .filter((surface) => predicate(surface) && isUiSurfaceActive(game, surface.id))
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((surface) => surface.id);
}

export function getUiVisibilitySelectors(game: GameState): UiVisibilitySelectors {
  return {
    resourceCounters: getActiveMvpSurfaces(
      game,
      (surface) => surface.category === "resource_panel",
    ),
    actionButtons: getActiveMvpSurfaces(
      game,
      (surface) =>
        surface.id === MVP_IDS.uiSurfaces.manualTesting ||
        surface.id === MVP_IDS.uiSurfaces.bugReporting,
    ),
    upgradePanels: getActiveMvpSurfaces(
      game,
      (surface) => surface.category === "upgrade_panel",
    ),
    promotionProgress: getActiveMvpSurfaces(
      game,
      (surface) => surface.id === MVP_IDS.uiSurfaces.promotionProgress,
    ),
    promoteAction: getActiveMvpSurfaces(
      game,
      (surface) =>
        surface.id === MVP_IDS.uiSurfaces.promoteAction &&
        surface.controlledByUnlockId !== null &&
        game.unlocks[surface.controlledByUnlockId] === "available",
    ),
  };
}
