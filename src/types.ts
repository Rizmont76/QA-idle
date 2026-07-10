export type UpgradeId = "checklist" | "coffee";
export type TabId = "manual";
export type CareerStage = "junior" | "middle";

export interface Upgrade {
  id: UpgradeId;
  group: TabId;
  name: string;
  description: string;
  flavor: string;
  baseCost: number;
  costGrowth: number;
  bugsPerClick: number;
}

export interface DerivedStats {
  bugsPerClick: number;
  moneyPerBug: number;
}

export interface GameState {
  bugs: number;
  money: number;
  totalBugsFound: number;
  totalMoneyEarned: number;
  lastPlayedAt: number;
  careerStage: CareerStage;
  upgrades: Record<UpgradeId, number>;
}

export interface CareerStageDefinition {
  id: CareerStage;
  label: string;
  nextLabel?: string;
  description: string;
  requirementText?: string;
  canPromote?: (game: GameState) => boolean;
}
