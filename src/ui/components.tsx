import type { AnimationEventHandler, ReactNode } from "react";

const FULL_PROGRESS_PERCENT = 100;

interface ActionButtonProps {
  readonly actionId: string;
  readonly ariaLabel: string;
  readonly canCommit: boolean;
  readonly children: ReactNode;
  readonly className?: string;
  readonly descriptionId?: string;
  readonly onClick: () => void;
  readonly onAnimationEnd?: AnimationEventHandler<HTMLButtonElement>;
}

export function ActionButton({
  actionId,
  ariaLabel,
  canCommit,
  children,
  className,
  descriptionId,
  onClick,
  onAnimationEnd,
}: ActionButtonProps) {
  return (
    <button
      className={className}
      type="button"
      data-action-id={actionId}
      aria-disabled={!canCommit}
      aria-describedby={descriptionId}
      aria-label={ariaLabel}
      onAnimationEnd={onAnimationEnd}
      onClick={() => {
        if (canCommit) {
          onClick();
        }
      }}
    >
      {children}
    </button>
  );
}

interface ResourceCounterProps {
  readonly helper: string;
  readonly icon: string;
  readonly label: string;
  readonly resourceId: string;
  readonly tone: "bugs" | "money";
  readonly value: string;
}

export function ResourceCounter({
  helper,
  icon,
  label,
  resourceId,
  tone,
  value,
}: ResourceCounterProps) {
  return (
    <article
      className={`metric primary resource-counter resource-counter-${tone}`}
      data-resource-id={resourceId}
      aria-label={`${label}: ${value}`}
    >
      <span className="metric-label">
        <span className={`metric-icon ${tone === "bugs" ? "bug-icon" : "money-icon"}`}>
          {icon}
        </span>
        {label}
      </span>
      <strong>{value}</strong>
      <em>{helper}</em>
    </article>
  );
}

interface StateBadgeProps {
  readonly state: string;
}

export function StateBadge({ state }: StateBadgeProps) {
  return <span className="state-badge support-status">{state}</span>;
}

interface PurchaseActionCardProps {
  readonly action: ActionButtonProps;
  readonly children?: ReactNode;
  readonly description: ReactNode;
  readonly onAnimationEnd?: AnimationEventHandler<HTMLElement>;
  readonly reason: string;
  readonly state: "available" | "unavailable" | "max-level";
  readonly title: string;
}

export function PurchaseActionCard({
  action,
  children,
  description,
  onAnimationEnd,
  reason,
  state,
  title,
}: PurchaseActionCardProps) {
  return (
    <article
      className={`assistant-purchase purchase-card is-${state}`}
      data-component="AssistantLevelCard"
      onAnimationEnd={onAnimationEnd}
    >
      <div>
        <div className="purchase-card-heading">
          <h3>{title}</h3>
          <StateBadge
            state={
              state === "max-level"
                ? "Max level"
                : state === "available"
                  ? "Available"
                  : "Unavailable"
            }
          />
        </div>
        {description}
        {children}
      </div>
      <ActionButton {...action} />
      <p className="purchase-reason" id={action.descriptionId}>
        {reason}
      </p>
    </article>
  );
}

interface SupportUpgradeCardProps {
  readonly action: ActionButtonProps;
  readonly effectPreview: string;
  readonly name: string;
  readonly newlyUnlocked: boolean;
  readonly onAnimationEnd?: AnimationEventHandler<HTMLElement>;
  readonly owned: boolean;
  readonly purchaseEmphasis: boolean;
  readonly reason: string;
  readonly reasonIsError: boolean;
  readonly roleLabel: string;
  readonly status: string;
  readonly supportId: string;
  readonly unlocked: boolean;
}

export function SupportUpgradeCard({
  action,
  effectPreview,
  name,
  newlyUnlocked,
  onAnimationEnd,
  owned,
  purchaseEmphasis,
  reason,
  reasonIsError,
  roleLabel,
  status,
  supportId,
  unlocked,
}: SupportUpgradeCardProps) {
  return (
    <article
      className={`support-card ${owned ? "is-owned" : ""} ${
        unlocked ? "is-unlocked" : "is-locked"
      } ${newlyUnlocked ? "is-newly-unlocked" : ""} ${
        purchaseEmphasis ? "is-bought" : ""
      }`}
      data-component="SupportUpgradeCard"
      data-support-id={supportId}
      aria-label={`${name}, ${roleLabel}, optional, ${status}`}
      onAnimationEnd={onAnimationEnd}
    >
      <div className="support-card-heading">
        <div>
          <h4>{name}</h4>
          <p className="support-role">{roleLabel}</p>
        </div>
        <StateBadge state={status} />
      </div>
      <p className="support-preview">{effectPreview}</p>
      <ActionButton {...action} />
      <p
        className={`support-reason ${reasonIsError ? "is-error" : ""}`}
        id={action.descriptionId}
        role={reasonIsError ? "alert" : undefined}
      >
        {reason}
      </p>
    </article>
  );
}

interface ProgressBarProps {
  readonly label: string;
  readonly percent: number;
  readonly valueMax: number;
  readonly valueNow: number;
  readonly valueText: string;
}

export function ProgressBar({
  label,
  percent,
  valueMax,
  valueNow,
  valueText,
}: ProgressBarProps) {
  const boundedPercent = Math.min(FULL_PROGRESS_PERCENT, Math.max(0, percent));

  return (
    <div
      className="panel-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={valueMax}
      aria-valuenow={valueNow}
      aria-valuetext={valueText}
    >
      <span style={{ width: `${String(boundedPercent)}%` }} />
    </div>
  );
}

interface RequirementRowProps {
  readonly complete: boolean;
  readonly current: string;
  readonly label: string;
  readonly target: string;
}

export function RequirementRow({
  complete,
  current,
  label,
  target,
}: RequirementRowProps) {
  return (
    <div className={complete ? "requirement complete" : "requirement"}>
      <dt>
        <span>{complete ? "Complete" : "Pending"}</span>
        {label}
      </dt>
      <dd>
        <strong>{current}</strong>
        <span>of {target}</span>
      </dd>
    </div>
  );
}

interface FeedbackToastProps {
  readonly children: ReactNode;
  readonly kind: "promotion" | "unlock" | "milestone";
  readonly title: string;
}

export function FeedbackToast({ children, kind, title }: FeedbackToastProps) {
  return (
    <aside className={`toast ${kind}-toast`} role="status">
      <strong>{title}</strong>
      <span>{children}</span>
    </aside>
  );
}
