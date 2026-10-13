import { useCallback, useEffect, useRef, useState } from "react";
import type { ReleaseLabAction, ReleaseLabState } from "../types";
import { LAB } from "../game/releaseLab/data";
import { advanceReleaseLab, releaseLabAction } from "../game/releaseLab/engine";
import { exportReleaseLab, loadReleaseLab } from "../game/releaseLab/persistence";

export function useReleaseLab() {
  const [loaded] = useState(() =>
    loadReleaseLab({ getItem: (key) => window.localStorage.getItem(key) }),
  );
  const [game, setGame] = useState(() => advanceReleaseLab(loaded.state, Date.now()));
  const current = useRef(game);
  const blocked = useRef(loaded.blocked);
  const [isBlocked, setIsBlocked] = useState(loaded.blocked);
  const paused = useRef(false);
  const [otherTab, setOtherTab] = useState(false);
  const [warning, setWarning] = useState(loaded.warning);
  const commit = useCallback((s: ReleaseLabState) => {
    if (paused.current) {
      return;
    }
    current.current = s;
    setGame(s);
    if (blocked.current) {
      return;
    }
    try {
      window.localStorage.setItem(LAB.key, exportReleaseLab(s));
    } catch {
      setWarning("Браузер не зберігає прогрес. Експортуй лабораторію.");
    }
  }, []);
  useEffect(() => {
    const timer = window.setInterval(
      () => commit(advanceReleaseLab(current.current, Date.now())),
      LAB.tickMs,
    );
    const external = (event: StorageEvent) => {
      if (event.key === LAB.key && event.newValue !== null) {
        paused.current = true;
        setOtherTab(true);
      }
    };
    const checkpoint = () => commit(advanceReleaseLab(current.current, Date.now()));
    window.addEventListener("storage", external);
    window.addEventListener("pagehide", checkpoint);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", external);
      window.removeEventListener("pagehide", checkpoint);
    };
  }, [commit]);
  const send = (action: ReleaseLabAction) =>
    commit(releaseLabAction(current.current, action).state);
  const replace = (s: ReleaseLabState) => {
    blocked.current = false;
    setIsBlocked(false);
    setWarning("");
    commit(advanceReleaseLab(s, Date.now()));
  };
  return {
    game,
    send,
    replace,
    warning,
    blocked: isBlocked,
    original: loaded.original,
    otherTab,
  };
}
