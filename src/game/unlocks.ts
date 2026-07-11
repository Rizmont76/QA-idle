import { uiSurfaceDefinitions } from "../gameData";
import type { GameState, UiSurfaceId, UnlockId } from "../types";

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
