import { useEffect, useRef, useState } from "react";
import type { CareerAction, CareerState } from "../types";
import { CAREER_RULES as R, BADGES } from "../game/career/content";
import { act, advanceCareer } from "../game/career/engine";
import type { TimeResult } from "../game/career/engine";
import { exportCareer, loadCareer } from "../game/career/persistence";

export function useCareer() {
  const [loaded] = useState(() =>
    loadCareer({
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => {
        window.localStorage.setItem(key, value);
      },
    }),
  );
  const [game, setGame] = useState(loaded.state);
  const current = useRef(game);
  const blocked = useRef(loaded.blocked);
  const paused = useRef(false);
  const [otherTab, setOtherTab] = useState(false);
  const [warning, setWarning] = useState(loaded.warning);
  const [saved, setSaved] = useState(!loaded.warning && !loaded.blocked);
  const [summary, setSummary] = useState<TimeResult | null>(
    loaded.summary && loaded.summary.seconds >= R.returnSummarySeconds
      ? loaded.summary
      : null,
  );
  const [toast, setToast] = useState("");

  function persist(state: CareerState) {
    if (blocked.current || paused.current) {
      return;
    }
    try {
      localStorage.setItem(R.saveKey, exportCareer(state));
      setSaved(true);
    } catch {
      setSaved(false);
      setWarning("Не вдалося зберегти гру. Експортуй резервну копію в налаштуваннях.");
    }
  }
  function commit(state: CareerState) {
    const badge = state.badges.find((id) => !current.current.badges.includes(id));
    if (badge) {
      setToast(
        `Досягнення: ${BADGES.find((b) => b.id === badge)?.title ?? badge}. +2% продуктивності!`,
      );
    }
    current.current = state;
    setGame(state);
  }
  function send(action: CareerAction) {
    if (paused.current) {
      return;
    }
    const result = act(current.current, action);
    const badge = result.state.badges.find((id) => !current.current.badges.includes(id));
    commit(result.state);
    if (result.message) {
      setToast(
        `${result.message}${badge ? ` Досягнення: ${BADGES.find((b) => b.id === badge)?.title ?? badge}!` : ""}`,
      );
    }
    persist(result.state);
  }
  function replace(state: CareerState) {
    if (paused.current) {
      return;
    }
    blocked.current = false;
    setWarning("");
    setSummary(null);
    current.current = state;
    setGame(state);
    persist(state);
    setToast("Збереження оновлено.");
  }
  useEffect(() => {
    function checkpoint() {
      if (blocked.current || paused.current) {
        return;
      }
      try {
        localStorage.setItem(R.saveKey, exportCareer(current.current));
        setSaved(true);
      } catch {
        setSaved(false);
        setWarning("Не вдалося зберегти гру. Експортуй резервну копію в налаштуваннях.");
      }
    }
    function step(offline: boolean) {
      if (paused.current) {
        return;
      }
      const now = Date.now();
      const wasOffline = offline || now - current.current.lastTick > R.sleepThresholdMs;
      const result = advanceCareer(current.current, now, wasOffline);
      const badge = result.state.badges.find(
        (id) => !current.current.badges.includes(id),
      );
      if (badge) {
        setToast(
          `Досягнення: ${BADGES.find((b) => b.id === badge)?.title ?? badge}. +2% продуктивності!`,
        );
      }
      current.current = result.state;
      setGame(result.state);
      if (wasOffline && result.seconds >= R.returnSummarySeconds) {
        setSummary(result);
      }
    }
    const tick = window.setInterval(() => {
      if (!document.hidden) {
        step(false);
      }
    }, R.tickMs);
    const save = window.setInterval(() => {
      if (!document.hidden) {
        checkpoint();
      }
    }, R.saveMs);
    function visibility() {
      step(!document.hidden);
      checkpoint();
    }
    function leaving() {
      step(document.hidden);
      checkpoint();
    }
    function changed(event: StorageEvent) {
      if (event.key === R.saveKey && event.newValue !== null) {
        paused.current = true;
        setOtherTab(true);
      }
    }
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", leaving);
    window.addEventListener("storage", changed);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(save);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", leaving);
      window.removeEventListener("storage", changed);
    };
  }, []);
  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => {
      setToast("");
    }, R.saveMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);
  return {
    game,
    send,
    replace,
    saved,
    warning,
    otherTab,
    summary,
    dismissSummary: () => {
      setSummary(null);
    },
    toast,
    clearToast: () => {
      setToast("");
    },
  };
}
