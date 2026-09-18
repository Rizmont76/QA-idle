import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { percent } from "./careerUtils";

export function BugIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="m11 5 2 4m8-4-2 4M5 12l5 2m17-2-5 2M4 20h6m18 0h-6M7 28l5-5m13 5-5-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect
        x="10"
        y="9"
        width="12"
        height="18"
        rx="6"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M10 15h12M16 15v12" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
export function Meter({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  return (
    <div
      className="meter"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.max(0, Math.min(max, value))}
    >
      <span style={{ width: `${String(percent(value, max))}%` }} />
    </div>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
export function ConfirmDialog({
  title,
  children,
  label,
  danger = false,
  confirm,
  close,
}: {
  title: string;
  children: ReactNode;
  label: string;
  danger?: boolean;
  confirm: () => void;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const target = dialog.current;
    const previous = document.activeElement;
    target?.showModal();
    return () => {
      target?.close();
      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, []);
  return (
    <dialog
      className="confirm-dialog"
      ref={dialog}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="eyebrow">QA IDLE</div>
      <h2 id="dialog-title">{title}</h2>
      <div className="dialog-body">{children}</div>
      <div className="dialog-actions">
        <button className="button ghost" onClick={close} autoFocus>
          Скасувати
        </button>
        <button
          className={`button ${danger ? "danger" : "primary"}`}
          onClick={() => {
            confirm();
            close();
          }}
        >
          {label}
        </button>
      </div>
    </dialog>
  );
}
