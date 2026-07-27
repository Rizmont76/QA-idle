import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ActionButton,
  ProgressBar,
  PurchaseActionCard,
  RequirementRow,
  ResourceCounter,
  SupportUpgradeCard,
} from "./components";

afterEach(cleanup);

describe("VD-02 component primitives", () => {
  it("keeps an unavailable explained action focusable without dispatching", () => {
    const onClick = vi.fn();

    render(
      <>
        <ActionButton
          actionId="buy-example"
          ariaLabel="Buy example unavailable"
          canCommit={false}
          descriptionId="buy-example-reason"
          onClick={onClick}
        >
          Unavailable
        </ActionButton>
        <p id="buy-example-reason">Not affordable with current Money.</p>
      </>,
    );

    const action = screen.getByRole("button", { name: "Buy example unavailable" });
    expect(action).toHaveAttribute("aria-disabled", "true");
    expect(action).toHaveAccessibleDescription(/not affordable/i);

    action.focus();
    expect(action).toHaveFocus();
    fireEvent.click(action);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders resource identity through text, icon and helper copy", () => {
    render(
      <>
        <ResourceCounter
          helper="+1.8 per second from Junior QA Assistant"
          icon="B"
          label="Bugs Found"
          resourceId="bugs_found"
          tone="bugs"
          value="24.5"
        />
        <ResourceCounter
          helper="Report bugs to earn"
          icon="$"
          label="Money"
          resourceId="money"
          tone="money"
          value="$160"
        />
      </>,
    );

    expect(screen.getByRole("article", { name: "Bugs Found: 24.5" })).toHaveTextContent(
      "B",
    );
    expect(screen.getByRole("article", { name: "Money: $160" })).toHaveTextContent(
      "Report bugs to earn",
    );
  });

  it("preserves max-level purchase state and its explanation", () => {
    const onClick = vi.fn();

    render(
      <PurchaseActionCard
        title="Buy 1 level"
        state="max-level"
        description={<p>Level 25 to 25</p>}
        reason="Assistant is already at max level."
        action={{
          actionId: "assistant-buy-one",
          ariaLabel: "Buy 1 Assistant level unavailable",
          canCommit: false,
          children: "Max level",
          descriptionId: "assistant-buy-one-reason",
          onClick,
        }}
      />,
    );

    expect(screen.getByText("Max level", { selector: ".state-badge" })).toBeVisible();
    const action = screen.getByRole("button", {
      name: "Buy 1 Assistant level unavailable",
    });
    expect(action).toHaveAccessibleDescription(/already at max level/i);
    fireEvent.click(action);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders locked and owned Support Upgrade states persistently", () => {
    const onClick = vi.fn();
    const commonProps = {
      effectPreview: "Offline efficiency: 40% to 55%",
      name: "Handover Notes",
      newlyUnlocked: false,
      purchaseEmphasis: false,
      reasonIsError: false,
      roleLabel: "Offline Handover Support",
      supportId: "support_offline_handover",
    } as const;
    const { rerender } = render(
      <SupportUpgradeCard
        {...commonProps}
        action={{
          actionId: "buy-handover",
          ariaLabel: "Handover Notes locked until Assistant level 5",
          canCommit: false,
          children: "Level 5 required",
          descriptionId: "handover-reason",
          onClick,
        }}
        owned={false}
        reason="Unlocks at Assistant level 5."
        status="Locked"
        unlocked={false}
      />,
    );

    const lockedAction = screen.getByRole("button", {
      name: /locked until Assistant level 5/i,
    });
    expect(lockedAction).toHaveAccessibleDescription(/unlocks at assistant level 5/i);
    expect(screen.getByRole("article", { name: /optional, Locked/i })).toHaveClass(
      "is-locked",
    );

    rerender(
      <SupportUpgradeCard
        {...commonProps}
        action={{
          actionId: "buy-handover",
          ariaLabel: "Handover Notes owned",
          canCommit: false,
          children: "Owned",
          descriptionId: "handover-reason",
          onClick,
        }}
        owned
        reason="Purchased and active."
        status="Owned"
        unlocked
      />,
    );

    expect(screen.getByRole("article", { name: /optional, Owned/i })).toHaveClass(
      "is-owned",
    );
    expect(screen.getByRole("button", { name: "Handover Notes owned" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("exposes numeric progress and a non-color requirement state", () => {
    render(
      <>
        <ProgressBar
          label="Promotion requirements completed"
          percent={50}
          valueMax={4}
          valueNow={2}
          valueText="2 of 4"
        />
        <dl>
          <RequirementRow
            complete
            current="$150"
            label="Lifetime money earned"
            target="$150"
          />
        </dl>
      </>,
    );

    expect(
      screen.getByRole("progressbar", { name: "Promotion requirements completed" }),
    ).toHaveAttribute("aria-valuetext", "2 of 4");
    expect(screen.getByText("Complete")).toBeVisible();
    expect(screen.getByText("Lifetime money earned")).toBeVisible();
  });
});
