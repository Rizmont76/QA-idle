import type { GameplayEventDescriptor } from "../types";

export interface GameplayEventListener {
  id: string;
  priority?: number;
  handle: (event: GameplayEventDescriptor) => void;
}

export interface GameplayEventDispatchResult {
  events: readonly GameplayEventDescriptor[];
  deliveries: readonly {
    eventId: GameplayEventDescriptor["id"];
    listenerId: string;
  }[];
}

function getListenerPriority(listener: GameplayEventListener) {
  return listener.priority ?? 0;
}

function sortGameplayEventListeners(
  listeners: readonly GameplayEventListener[],
): GameplayEventListener[] {
  return [...listeners].sort((left, right) => {
    const priorityDifference = getListenerPriority(left) - getListenerPriority(right);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return left.id.localeCompare(right.id);
  });
}

export function dispatchGameplayEvents(
  events: readonly GameplayEventDescriptor[],
  listeners: readonly GameplayEventListener[] = [],
): GameplayEventDispatchResult {
  const orderedEvents = [...events];
  const orderedListeners = sortGameplayEventListeners(listeners);
  const deliveries: {
    eventId: GameplayEventDescriptor["id"];
    listenerId: string;
  }[] = [];

  for (const event of orderedEvents) {
    for (const listener of orderedListeners) {
      listener.handle(event);
      deliveries.push({
        eventId: event.id,
        listenerId: listener.id,
      });
    }
  }

  return {
    events: orderedEvents,
    deliveries,
  };
}
