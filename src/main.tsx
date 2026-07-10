import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  ACHIEVEMENT_TOAST_MS,
  BUG_VALUE,
  OFFLINE_TOAST_MS,
  PROMOTION_TOAST_MS,
  achievements,
  automationUpgrades,
  careerStages,
  initialState,
  upgrades,
} from "./gameData";
import {
  formatNumber,
  getDerivedStats,
  getProgressTarget,
  getPromotionStage,
  getUpgradeCost,
  hasStage,
} from "./gameLogic";
import { clearSave, loadSave, saveGame } from "./save";
import type {
  Achievement,
  AutomationUpgradeId,
  CareerStageDefinition,
  TabId,
  UpgradeId,
} from "./types";
import "./styles.css";

function App() {
  const [loadedSave] = useState(() => loadSave());
  const [game, setGame] = useState(loadedSave.game);
  const [activeTab, setActiveTab] = useState<TabId>("manual");
  const [offlineBugs, setOfflineBugs] = useState(loadedSave.offlineBugs);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(
    null,
  );
  const [promotionToast, setPromotionToast] =
    useState<CareerStageDefinition | null>(null);
  const [clickBurst, setClickBurst] = useState(false);
  const [boughtUpgradeId, setBoughtUpgradeId] = useState<
    UpgradeId | AutomationUpgradeId | null
  >(null);

  const stats = useMemo(() => getDerivedStats(game), [game]);
  const progressTarget = useMemo(() => getProgressTarget(game), [game]);
  const progressPercent = Math.min(
    100,
    Math.max(0, (progressTarget.current / progressTarget.cost) * 100),
  );
  const currentStage = careerStages.find((stage) => stage.id === game.careerStage);
  const promotionStage = getPromotionStage(game);
  const canUseTeam = hasStage(game, "middle");
  const canUseAutomation = hasStage(game, "senior");
  const stageNumber = game.careerStage === "junior" ? 1 : game.careerStage === "middle" ? 2 : 3;

  useEffect(() => {
    saveGame(game);
  }, [game]);

  useEffect(() => {
    if (activeTab === "team" && !canUseTeam) {
      setActiveTab("manual");
    }

    if (activeTab === "automation" && !canUseAutomation) {
      setActiveTab(canUseTeam ? "team" : "manual");
    }
  }, [activeTab, canUseAutomation, canUseTeam]);

  useEffect(() => {
    if (!canUseAutomation) {
      return;
    }

    const newlyUnlocked = achievements.filter(
      (achievement) =>
        !game.achievements.includes(achievement.id) &&
        achievement.isUnlocked(game, stats),
    );

    if (newlyUnlocked.length === 0) {
      return;
    }

    setGame((current) => ({
      ...current,
      achievements: [
        ...current.achievements,
        ...newlyUnlocked.map((achievement) => achievement.id),
      ],
      lastPlayedAt: Date.now(),
    }));
    setAchievementToast(newlyUnlocked[0]);
  }, [canUseAutomation, game, stats]);

  useEffect(() => {
    if (offlineBugs <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOfflineBugs(0);
    }, OFFLINE_TOAST_MS);

    return () => window.clearTimeout(timeoutId);
  }, [offlineBugs]);

  useEffect(() => {
    if (!achievementToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAchievementToast(null);
    }, ACHIEVEMENT_TOAST_MS);

    return () => window.clearTimeout(timeoutId);
  }, [achievementToast]);

  useEffect(() => {
    if (!promotionToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPromotionToast(null);
    }, PROMOTION_TOAST_MS);

    return () => window.clearTimeout(timeoutId);
  }, [promotionToast]);

  useEffect(() => {
    if (stats.bugsPerSecond <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const earnedBugs = stats.bugsPerSecond / 10;

      setGame((current) => ({
        ...current,
        bugs: current.bugs + earnedBugs,
        totalBugsFound: current.totalBugsFound + earnedBugs,
      }));
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [stats.bugsPerSecond]);

  function runQaTest() {
    setClickBurst(false);
    window.requestAnimationFrame(() => setClickBurst(true));

    setGame((current) => ({
      ...current,
      bugs: current.bugs + stats.bugsPerClick,
      totalBugsFound: current.totalBugsFound + stats.bugsPerClick,
      lastPlayedAt: Date.now(),
    }));
  }

  function reportBugs() {
    if (game.bugs <= 0) {
      return;
    }

    const reportedBugs = Math.floor(game.bugs);
    const earnedMoney = Math.floor(
      reportedBugs * BUG_VALUE * stats.reportMultiplier,
    );
    const earnedReputation = canUseAutomation
      ? Math.max(0, Math.floor((reportedBugs / 45) * stats.reportMultiplier))
      : 0;

    if (reportedBugs <= 0) {
      return;
    }

    setGame((current) => ({
      ...current,
      bugs: current.bugs - reportedBugs,
      money: current.money + earnedMoney,
      reputation: current.reputation + earnedReputation,
      totalMoneyEarned: current.totalMoneyEarned + earnedMoney,
      totalReputationEarned:
        current.totalReputationEarned + earnedReputation,
      lastPlayedAt: Date.now(),
    }));
  }

  function buyUpgrade(upgradeId: UpgradeId) {
    const upgrade = upgrades.find((item) => item.id === upgradeId);

    if (!upgrade || (upgrade.group === "team" && !canUseTeam)) {
      return;
    }

    const owned = game.upgrades[upgrade.id];
    const cost = getUpgradeCost(upgrade, owned);

    if (game.money < cost) {
      return;
    }

    setBoughtUpgradeId(null);
    window.requestAnimationFrame(() => setBoughtUpgradeId(upgrade.id));

    setGame((current) => ({
      ...current,
      money: current.money - cost,
      lastPlayedAt: Date.now(),
      upgrades: {
        ...current.upgrades,
        [upgrade.id]: current.upgrades[upgrade.id] + 1,
      },
    }));
  }

  function buyAutomationUpgrade(upgradeId: AutomationUpgradeId) {
    const upgrade = automationUpgrades.find((item) => item.id === upgradeId);

    if (!upgrade || !canUseAutomation) {
      return;
    }

    const owned = game.automationUpgrades[upgrade.id];
    const cost = getUpgradeCost(upgrade, owned);

    if (game.reputation < cost) {
      return;
    }

    setBoughtUpgradeId(null);
    window.requestAnimationFrame(() => setBoughtUpgradeId(upgrade.id));

    setGame((current) => ({
      ...current,
      reputation: current.reputation - cost,
      lastPlayedAt: Date.now(),
      automationUpgrades: {
        ...current.automationUpgrades,
        [upgrade.id]: current.automationUpgrades[upgrade.id] + 1,
      },
    }));
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
    setActiveTab(nextStage.id === "middle" ? "team" : "automation");
  }

  function resetSave() {
    clearSave();
    setOfflineBugs(0);
    setAchievementToast(null);
    setPromotionToast(null);
    setActiveTab("manual");
    setGame({
      ...initialState,
      lastPlayedAt: Date.now(),
    });
  }

  const availableTabs: Array<[TabId, string, boolean]> = [
    ["manual", "Manual Work", true],
    ["team", "Team", canUseTeam],
    ["automation", "Automation", canUseAutomation],
  ];
  const visibleMoneyUpgrades = upgrades.filter(
    (upgrade) => upgrade.group === activeTab,
  );

  return (
    <main className={`app-shell stage-${game.careerStage}`}>
      <div className="toast-stack">
        {offlineBugs > 0 && (
          <aside className="toast welcome-toast" role="status">
            <strong>Welcome back</strong>
            <span>
              {formatNumber(offlineBugs)} bugs found while you were away.
            </span>
          </aside>
        )}

        {achievementToast && (
          <aside className="toast achievement-toast" role="status">
            <strong>Achievement unlocked</strong>
            <span>{achievementToast.name}</span>
          </aside>
        )}

        {promotionToast && (
          <aside className="toast promotion-toast" role="status">
            <strong>Promotion unlocked</strong>
            <span>{promotionToast.label}</span>
          </aside>
        )}
      </div>

      <section className="hero">
        <div>
          <p className="eyebrow">Stage {stageNumber}</p>
          <h1>{currentStage?.label || "Junior QA"}</h1>
          <p className="stage-focus">{currentStage?.description}</p>
        </div>
        <div className="top-icons" aria-label="Game controls">
          <span title="Achievements">T</span>
          <span title="Stats">B</span>
          <button className="icon-button" type="button" onClick={resetSave} title="Reset Save">
            R
          </button>
        </div>
      </section>

      <section className="brand-bar" aria-label="Game title">
        <strong><span>QA</span> Idle</strong>
      </section>

      <section className="stage-panel" aria-label="Career stage">
        <div>
          <span>Current role</span>
          <strong>{currentStage?.label || "Junior QA"}</strong>
          <p>{currentStage?.description}</p>
        </div>
        {promotionStage ? (
          <button type="button" onClick={promote}>
            Promote to {promotionStage.label}
          </button>
        ) : (
          <p className="stage-requirement">
            {currentStage?.requirementText || "Keep growing your QA practice."}
          </p>
        )}
      </section>

      <section
        className={`resource-grid ${canUseAutomation ? "" : "two-columns"}`}
        aria-label="Current resources"
      >
        <div className="metric primary">
          <span className="metric-label"><span className="metric-icon bug-icon">B</span>Bugs Found</span>
          <strong>{formatNumber(game.bugs)}</strong>
          <em>+{formatNumber(stats.bugsPerClick)} per click</em>
        </div>
        <div className="metric primary">
          <span className="metric-label"><span className="metric-icon money-icon">$</span>Money</span>
          <strong>${formatNumber(game.money)}</strong>
          <em>{canUseTeam ? `+${formatNumber(stats.bugsPerSecond)} / sec` : "Report bugs to earn"}</em>
        </div>
        {canUseAutomation && (
          <div className="metric reputation">
            <span className="metric-label">
              <span className="metric-icon rep-icon">R</span>
              Reputation
              <span
                className="info-tooltip"
                aria-label="Reputation unlocks at Senior QA and is earned when you report bugs. Find bugs, then press Report Bugs to convert them into money and reputation."
                tabIndex={0}
              >
                i
              </span>
            </span>
            <strong>{formatNumber(game.reputation)}</strong>
            <em>earned from reports</em>
          </div>
        )}
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
          disabled={game.bugs < 1}
        >
          Report Bugs <span>{game.bugs >= 1 ? `+$${formatNumber(Math.floor(game.bugs * stats.reportMultiplier))}` : ""}</span>
        </button>
      </section>

      {(canUseTeam || canUseAutomation) && (
        <section className="progress-panel" aria-label="Next upgrade progress">
          <div>
            <span>Next big upgrade</span>
            <strong>{progressTarget.name}</strong>
          </div>
          <div className="progress-meta">
            {formatNumber(progressTarget.current)} /{" "}
            {formatNumber(progressTarget.cost)}{" "}
            {progressTarget.resource === "money" ? "money" : "reputation"}
          </div>
          <div className="progress-track">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </section>
      )}

      <nav className="tabs" aria-label="Upgrade sections">
        {availableTabs.map(([id, label, unlocked]) => (
          <button
            className={activeTab === id ? "active" : ""}
            disabled={!unlocked}
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <section className="content-grid">
        <div className="panel">
          <h2>
            {activeTab === "manual"
              ? "Manual Work"
              : activeTab === "team"
                ? "Team"
                : "Automation"}
          </h2>
          <div className="shop-list">
            {activeTab !== "automation" &&
              visibleMoneyUpgrades.map((upgrade) => {
                const owned = game.upgrades[upgrade.id];
                const cost = getUpgradeCost(upgrade, owned);
                const canBuy = game.money >= cost;

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
                        <span>Owned {owned}</span>
                      </div>
                      <p>{upgrade.description}</p>
                      <p className="upgrade-flavor">{upgrade.flavor}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => buyUpgrade(upgrade.id)}
                      disabled={!canBuy}
                    >
                      Buy ${formatNumber(cost)}
                    </button>
                  </article>
                );
              })}

            {activeTab === "automation" &&
              automationUpgrades.map((upgrade) => {
                const owned = game.automationUpgrades[upgrade.id];
                const cost = getUpgradeCost(upgrade, owned);
                const canBuy = game.reputation >= cost;

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
                        <span>Owned {owned}</span>
                      </div>
                      <p>{upgrade.description}</p>
                      <p className="upgrade-flavor">{upgrade.flavor}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => buyAutomationUpgrade(upgrade.id)}
                      disabled={!canBuy}
                    >
                      Buy {formatNumber(cost)} rep
                    </button>
                  </article>
                );
              })}
          </div>
        </div>

        <div className="side-column">
          <div className="panel">
            <h2>Stats</h2>
            <dl className="stats-list">
              <div>
                <dt>Bugs per click</dt>
                <dd>{formatNumber(stats.bugsPerClick)}</dd>
              </div>
              {canUseTeam && (
                <div>
                  <dt>Bugs per second</dt>
                  <dd>{formatNumber(stats.bugsPerSecond)}</dd>
                </div>
              )}
              {canUseAutomation && (
                <>
                  <div>
                    <dt>Report value</dt>
                    <dd>{Math.round(stats.reportMultiplier * 100)}%</dd>
                  </div>
                  <div>
                    <dt>Total reputation earned</dt>
                    <dd>{formatNumber(game.totalReputationEarned)}</dd>
                  </div>
                </>
              )}
              <div>
                <dt>Total bugs found</dt>
                <dd>{formatNumber(game.totalBugsFound)}</dd>
              </div>
              <div>
                <dt>Total money earned</dt>
                <dd>${formatNumber(game.totalMoneyEarned)}</dd>
              </div>
            </dl>
          </div>

          {canUseAutomation && (
            <div className="panel">
              <h2>Achievements</h2>
              <div className="achievement-list">
                {achievements.map((achievement) => {
                  const unlocked = game.achievements.includes(achievement.id);

                  return (
                    <article
                      className={`achievement ${unlocked ? "unlocked" : ""}`}
                      key={achievement.id}
                    >
                      <strong>{achievement.name}</strong>
                      <span>{achievement.description}</span>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="career-footer" aria-label="Promotion progress">
        <div>
          <strong>{currentStage?.label || "Junior QA"}</strong>
          <span>Current stage</span>
        </div>
        <div className="career-arrow">to</div>
        <div>
          <strong>{currentStage?.nextLabel || "Founder path"}</strong>
          <span>{promotionStage ? "Promotion ready" : "Next goal"}</span>
        </div>
        <div className="career-progress">
          <span>{currentStage?.requirementText || "Keep scaling the QA company."}</span>
          <div className="progress-track">
            <span style={{ width: promotionStage ? "100%" : `${progressPercent}%` }} />
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
