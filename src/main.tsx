import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { PROMOTION_TOAST_MS, careerStages, initialState, upgrades } from "./gameData";
import {
  formatNumber,
  getDerivedStats,
  getPromotionProgress,
  getPromotionStage,
  getUpgradeCost,
  performManualTest,
  purchaseUpgrade,
  reportAllBugs,
} from "./gameLogic";
import { clearSave, loadSave, saveGame } from "./save";
import { MVP_IDS } from "./types";
import type { CareerStageDefinition, UpgradeId } from "./types";
import "./styles.css";

function App() {
  const [loadedSave] = useState(() => loadSave());
  const [game, setGame] = useState(loadedSave.game);
  const [promotionToast, setPromotionToast] = useState<CareerStageDefinition | null>(
    null,
  );
  const [clickBurst, setClickBurst] = useState(false);
  const [boughtUpgradeId, setBoughtUpgradeId] = useState<UpgradeId | null>(null);

  const stats = useMemo(() => getDerivedStats(game), [game]);
  const bugsFound = game.resources[MVP_IDS.resources.bugsFound];
  const money = game.resources[MVP_IDS.resources.money];
  const currentStage = careerStages.find((stage) => stage.id === game.careerStage);
  const promotionStage = getPromotionStage(game);
  const promotionProgress = getPromotionProgress(game);
  const isMvpComplete = game.careerStage === MVP_IDS.careerStages.middleQa;

  useEffect(() => {
    saveGame(game);
  }, [game]);

  useEffect(() => {
    if (!promotionToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPromotionToast(null);
    }, PROMOTION_TOAST_MS);

    return () => window.clearTimeout(timeoutId);
  }, [promotionToast]);

  function runQaTest() {
    setClickBurst(false);
    window.requestAnimationFrame(() => setClickBurst(true));

    setGame((current) => performManualTest(current).game);
  }

  function reportBugs() {
    setGame((current) => reportAllBugs(current).game);
  }

  function buyUpgrade(upgradeId: UpgradeId) {
    setGame((current) => {
      const result = purchaseUpgrade(current, upgradeId);

      if (result.ok) {
        setBoughtUpgradeId(null);
        window.requestAnimationFrame(() => setBoughtUpgradeId(upgradeId));
      }

      return result.game;
    });
  }

  function promote() {
    const nextStage = getPromotionStage(game);

    if (!nextStage) {
      return;
    }

    setGame((current) => ({
      ...current,
      careerStage: nextStage.id,
      lastPlayedAt: Date.now(),
    }));
    setPromotionToast(nextStage);
  }

  function resetSave() {
    clearSave();
    setPromotionToast(null);
    setGame({
      ...initialState,
      lastPlayedAt: Date.now(),
    });
  }

  return (
    <main className={`app-shell stage-${game.careerStage}`}>
      <div className="toast-stack">
        {promotionToast && (
          <aside className="toast promotion-toast" role="status">
            <strong>Promotion confirmed</strong>
            <span>{promotionToast.label} reached.</span>
          </aside>
        )}
      </div>

      <section className="hero">
        <div>
          <p className="eyebrow">{isMvpComplete ? "MVP complete" : "Stage 1"}</p>
          <h1>{currentStage?.label ?? "Junior QA"}</h1>
          <p className="stage-focus">{currentStage?.description}</p>
        </div>
        <div className="top-icons" aria-label="Game controls">
          <button
            className="icon-button"
            type="button"
            onClick={resetSave}
            title="Reset Save"
          >
            R
          </button>
        </div>
      </section>

      <section className="brand-bar" aria-label="Game title">
        <strong>
          <span>QA</span> Idle
        </strong>
      </section>

      <section className="stage-panel" aria-label="Career stage">
        <div>
          <span>Current role</span>
          <strong>{currentStage?.label ?? "Junior QA"}</strong>
          <p>{currentStage?.description}</p>
        </div>
        {promotionStage ? (
          <button type="button" onClick={promote}>
            Promote to {promotionStage.label}
          </button>
        ) : (
          <p className="stage-requirement">
            {isMvpComplete
              ? "The MVP endpoint has been reached."
              : currentStage?.requirementText}
          </p>
        )}
      </section>

      <section className="resource-grid two-columns" aria-label="Current resources">
        <div className="metric primary">
          <span className="metric-label">
            <span className="metric-icon bug-icon">B</span>Bugs Found
          </span>
          <strong>{formatNumber(bugsFound)}</strong>
          <em>+{formatNumber(stats.bugsPerClick)} per action</em>
        </div>
        <div className="metric primary">
          <span className="metric-label">
            <span className="metric-icon money-icon">$</span>Money
          </span>
          <strong>${formatNumber(money)}</strong>
          <em>Report bugs to earn</em>
        </div>
      </section>

      <section className="action-bar" aria-label="Main actions">
        <button
          className={`main-button ${clickBurst ? "is-clicked" : ""}`}
          type="button"
          onAnimationEnd={() => setClickBurst(false)}
          onClick={runQaTest}
        >
          Find Bug <span>+{formatNumber(stats.bugsPerClick)}</span>
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={reportBugs}
          disabled={bugsFound < 1}
        >
          Report Bugs{" "}
          <span>
            {bugsFound >= 1
              ? `+$${formatNumber(Math.floor(bugsFound * stats.moneyPerBug))}`
              : ""}
          </span>
        </button>
      </section>

      <section className="content-grid">
        <div className="panel">
          <h2>Manual Work</h2>
          <div className="shop-list">
            {upgrades.map((upgrade) => {
              const owned = game.upgrades[upgrade.id];
              const cost = getUpgradeCost(upgrade);
              const isOwned = owned >= upgrade.maxLevel;
              const canBuy = !isOwned && money >= cost;

              return (
                <article
                  className={`upgrade ${
                    boughtUpgradeId === upgrade.id ? "is-bought" : ""
                  }`}
                  key={upgrade.id}
                  onAnimationEnd={() => setBoughtUpgradeId(null)}
                >
                  <div>
                    <div className="upgrade-title">
                      <h3>{upgrade.name}</h3>
                      <span>{isOwned ? "Owned" : "Available"}</span>
                    </div>
                    <p>{upgrade.description}</p>
                    <p className="upgrade-flavor">{upgrade.flavor}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => buyUpgrade(upgrade.id)}
                    disabled={!canBuy}
                  >
                    {isOwned ? "Owned" : `Buy $${formatNumber(cost)}`}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <h2>Promotion Progress</h2>
          <dl className="progress-list">
            {promotionProgress.map((item) => {
              return (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd className={item.complete ? "complete" : ""}>
                    {item.prefix}
                    {formatNumber(item.current)} / {item.prefix}
                    {formatNumber(item.required)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <section className="career-footer" aria-label="Promotion progress">
        <div>
          <strong>{currentStage?.label ?? "Junior QA"}</strong>
          <span>Current stage</span>
        </div>
        <div className="career-arrow">to</div>
        <div>
          <strong>{currentStage?.nextLabel ?? "Middle QA"}</strong>
          <span>{promotionStage ? "Promotion ready" : "Next goal"}</span>
        </div>
        <div className="career-progress">
          <span>
            {isMvpComplete
              ? "Promotion completed. No additional systems are active in this MVP."
              : currentStage?.requirementText}
          </span>
          <div className="progress-track">
            <span style={{ width: promotionStage ? "100%" : "0%" }} />
          </div>
        </div>
      </section>
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element was not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
