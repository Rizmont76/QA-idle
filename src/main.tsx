import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  PROMOTION_TOAST_MS,
  careerStages,
  promotionDefinitions,
  upgrades,
} from "./gameData";
import {
  acceptPromotion,
  evaluatePromotionAvailability,
  formatCurrency,
  formatNumber,
  getDerivedStats,
  getPromotionProgress,
  getPromotionStage,
  getUiVisibilitySelectors,
  getUpgradeCost,
  performManualTest,
  purchaseUpgrade,
  reportAllBugs,
} from "./gameLogic";
import { loadSave, resetSave, saveGame } from "./save";
import { MVP_IDS } from "./types";
import type { CareerStageDefinition, UpgradeId } from "./types";
import "./styles.css";

const FULL_PROGRESS_PERCENT = 100;
const MVP_PROMOTION_REQUIREMENT_COUNT = 3;

function App() {
  const [loadedSave] = useState(() => {
    const save = loadSave();

    return { game: evaluatePromotionAvailability(save.game) };
  });
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
  const activePromotionDefinition = promotionDefinitions.find(
    (promotion) => promotion.fromCareerStageId === game.careerStage,
  );
  const nextStage = careerStages.find(
    (stage) =>
      stage.id ===
      (activePromotionDefinition?.toCareerStageId ?? MVP_IDS.careerStages.middleQa),
  );
  const visibility = useMemo(() => getUiVisibilitySelectors(game), [game]);
  const visibleActions = new Set(visibility.actionButtons);
  const isPromotionActionActive = visibility.promoteAction.includes(
    MVP_IDS.uiSurfaces.promoteAction,
  );
  const promotionStage = isPromotionActionActive ? getPromotionStage(game) : null;
  const promotionProgress = getPromotionProgress(game);
  const completedPromotionRequirements = promotionProgress.filter(
    (item) => item.complete,
  ).length;
  const promotionProgressPercent =
    promotionProgress.length > 0
      ? (completedPromotionRequirements / promotionProgress.length) *
        FULL_PROGRESS_PERCENT
      : 0;
  const activeRequirementText =
    promotionProgress.length === MVP_PROMOTION_REQUIREMENT_COUNT
      ? `Find ${formatNumber(
          promotionProgress[0]?.required ?? 0,
        )} lifetime bugs, earn ${formatCurrency(
          promotionProgress[1]?.required ?? 0,
        )} lifetime money, and buy ${formatNumber(
          promotionProgress[2]?.required ?? 0,
        )} upgrades.`
      : currentStage?.requirementText;
  const isMvpComplete = game.careerStage === MVP_IDS.careerStages.middleQa;
  const footerTargetLabel = isMvpComplete
    ? "MVP endpoint"
    : (currentStage?.nextLabel ?? "Middle QA");

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
    setGame((current) => {
      const result = acceptPromotion(current);

      if (result.ok) {
        const nextStage = careerStages.find(
          (stage) => stage.id === result.game.careerStage,
        );

        setPromotionToast(nextStage ?? null);
      }

      return result.game;
    });
  }

  function startNewGame() {
    const save = resetSave();

    setPromotionToast(null);
    setClickBurst(false);
    setBoughtUpgradeId(null);
    setGame(save.game);
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
          <p className="eyebrow">QA Idle</p>
          <h1>{isMvpComplete ? "Middle QA Reached" : "Junior QA Workspace"}</h1>
          <p className="stage-focus">
            {isMvpComplete
              ? "Vertical slice complete. Future gameplay remains hidden."
              : "Manual testing, bug reports, upgrades, and one clear promotion goal."}
          </p>
        </div>
        <div className="top-icons" aria-label="Game controls">
          <button
            className="icon-button"
            type="button"
            onClick={startNewGame}
            title="Reset Save"
          >
            R
          </button>
        </div>
      </section>

      <section className="stage-panel" aria-label="Career stage">
        <div>
          <span>Current role</span>
          <strong>{currentStage?.label ?? "Junior QA"}</strong>
          <p>{currentStage?.description}</p>
        </div>
        <p className="stage-requirement">
          {isMvpComplete ? "The MVP endpoint has been reached." : activeRequirementText}
        </p>
      </section>

      {isMvpComplete && (
        <section className="completion-panel" aria-label="MVP completion">
          <div>
            <span>Promotion completed</span>
            <strong>Middle QA reached</strong>
          </div>
          <p>
            This save has reached the end of the MVP vertical slice. No additional
            gameplay systems are active.
          </p>
        </section>
      )}

      {visibility.resourceCounters.includes(MVP_IDS.uiSurfaces.resourcesBasic) && (
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
            <strong>{formatCurrency(money)}</strong>
            <em>Report bugs to earn</em>
          </div>
        </section>
      )}

      {visibleActions.size > 0 && (
        <section className="action-bar" aria-label="Main actions">
          {visibleActions.has(MVP_IDS.uiSurfaces.manualTesting) && (
            <button
              className={`main-button ${clickBurst ? "is-clicked" : ""}`}
              type="button"
              onAnimationEnd={() => setClickBurst(false)}
              onClick={runQaTest}
            >
              Find Bug <span>+{formatNumber(stats.bugsPerClick)}</span>
            </button>
          )}
          {visibleActions.has(MVP_IDS.uiSurfaces.bugReporting) && (
            <button
              className="secondary-button"
              type="button"
              onClick={reportBugs}
              disabled={bugsFound < 1}
            >
              Report Bugs{" "}
              <span>
                {bugsFound >= 1
                  ? `+${formatCurrency(bugsFound * stats.moneyPerBug)}`
                  : "No bugs ready"}
              </span>
            </button>
          )}
        </section>
      )}

      <section className="content-grid">
        {visibility.upgradePanels.includes(MVP_IDS.uiSurfaces.upgradesBasic) && (
          <div className="panel">
            <h2>Basic Upgrades</h2>
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
                      {isOwned ? "Owned" : formatCurrency(cost)}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {visibility.promotionProgress.includes(MVP_IDS.uiSurfaces.promotionProgress) && (
          <div className="panel">
            <h2>Promotion Progress</h2>
            <div className="rank-route" aria-label="Promotion route">
              <div>
                <span>{isMvpComplete ? "Completed rank" : "Current rank"}</span>
                <strong>
                  {isMvpComplete ? "Junior QA" : (currentStage?.label ?? "Junior QA")}
                </strong>
              </div>
              <div>
                <span>{isMvpComplete ? "Reached rank" : "Next rank"}</span>
                <strong>{nextStage?.label ?? "Middle QA"}</strong>
              </div>
            </div>
            <div className="goal-summary">
              <strong>
                {completedPromotionRequirements} / {promotionProgress.length}
              </strong>
              <span>
                {isMvpComplete
                  ? "Promotion completed"
                  : promotionStage
                    ? "Promotion available"
                    : "Promotion goal"}
              </span>
            </div>
            <div className="panel-progress" aria-hidden="true">
              <span style={{ width: `${String(promotionProgressPercent)}%` }} />
            </div>
            <dl className="progress-list">
              {promotionProgress.map((item) => {
                return (
                  <div
                    className={item.complete ? "requirement complete" : "requirement"}
                    key={item.id}
                  >
                    <dt>
                      <span>{item.complete ? "Complete" : "Pending"}</span>
                      {item.label}
                    </dt>
                    <dd>
                      <strong>
                        {item.prefix === "$"
                          ? formatCurrency(item.current)
                          : formatNumber(item.current)}
                      </strong>
                      <span>
                        of{" "}
                        {item.prefix === "$"
                          ? formatCurrency(item.required)
                          : formatNumber(item.required)}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
            {isPromotionActionActive && promotionStage && (
              <button className="promote-button" type="button" onClick={promote}>
                Promote to {promotionStage.label}
              </button>
            )}
          </div>
        )}
      </section>

      <section className="career-footer" aria-label="Promotion progress">
        <div>
          <strong>{currentStage?.label ?? "Junior QA"}</strong>
          <span>{isMvpComplete ? "Current stage" : "Current rank"}</span>
        </div>
        <div className="career-arrow">to</div>
        <div>
          <strong>{footerTargetLabel}</strong>
          <span>
            {isMvpComplete
              ? "Completed milestone"
              : promotionStage
                ? "Promotion ready"
                : "Next goal"}
          </span>
        </div>
        <div className="career-progress">
          <span>
            {isMvpComplete
              ? "Promotion completed. No additional systems are active in this MVP."
              : activeRequirementText}
          </span>
          <div className="progress-track">
            <span style={{ width: `${String(promotionProgressPercent)}%` }} />
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
