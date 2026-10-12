import { useState } from "react";
import type { CareerState } from "../types";
import type { CareerView, PipelineView } from "../game/career/discovery";
import { architectureUnlocked } from "../game/career/architectureEffects";
import { networkUnlocked } from "../game/career/networkEffects";

interface Entry {
  id: CareerView;
  title: string;
  symbol: string;
}
interface Discovery {
  id: string;
  title: string;
  symbol: string;
  layer?: PipelineView;
  view?: CareerView;
}
export function UnlockNotice({
  game,
  entries,
  open,
  openLayer,
}: {
  game: CareerState;
  entries: readonly Entry[];
  open: (view: CareerView) => void;
  openLayer: (view: PipelineView) => void;
}) {
  const discoveries: Discovery[] = [
    ...entries.map((entry) => ({ ...entry, view: entry.id })),
    ...(architectureUnlocked(game)
      ? [
          {
            id: "architecture",
            title: "Архітектура",
            symbol: "╋",
            layer: "architecture" as const,
          },
        ]
      : []),
    ...(networkUnlocked(game)
      ? [{ id: "network", title: "Мережа", symbol: "◎", layer: "network" as const }]
      : []),
  ];
  const signature = discoveries.map((d) => d.id).join(",");
  const [previous, setPrevious] = useState(signature);
  const [revealed, setRevealed] = useState<Discovery[]>([]);
  // Compare during rendering so a reset/import cannot flash a stale late-layer notice.
  if (previous !== signature) {
    const old = previous.split(",");
    const lost = old.some((id) => !discoveries.some((d) => d.id === id));
    setPrevious(signature);
    setRevealed(lost ? [] : discoveries.filter((d) => !old.includes(d.id)));
  }
  if (!revealed.length) {
    return null;
  }
  return (
    <section className="unlock-notice" aria-label="Нове відкриття" role="status">
      <div>
        <span className="eyebrow">НОВІ МОЖЛИВОСТІ</span>
        <h2>{revealed.map((d) => d.title).join(" · ")}</h2>
      </div>
      <div className="unlock-actions">
        {revealed.map((d) => (
          <button
            className="button secondary"
            key={d.id}
            onClick={() => {
              if (d.layer) {
                openLayer(d.layer);
              } else if (d.view) {
                open(d.view);
              }
              setRevealed([]);
            }}
          >
            {d.symbol} {d.title} →
          </button>
        ))}
        <button
          className="text-button"
          aria-label="Закрити повідомлення про відкриття"
          onClick={() => setRevealed([])}
        >
          ×
        </button>
      </div>
    </section>
  );
}
