import { Sparkles, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import { PREVIEW } from "../transport";
export type Data = Record<string, any>;
export type Profile = {
  id: string;
  name: string;
  mode: "personal" | "community";
  actor?: string;
};
export type Session = {
  profile: Profile;
  scope: string;
  lane: string;
  lanes: { name: string; lane: { id: string; audience: string[] } }[];
  development: boolean;
  test_host?: boolean;
};
export type Work = {
  id: string;
  owner: string;
  request: string;
  state: string;
  display_safe_summary: string;
  revision: number;
  generation: number;
};
export type Artifact = {
  id: string;
  title: string;
  bytes: number;
  visibility: string;
  sha256: string;
  owner: string;
  provenance?: string;
  media_type?: string;
};
export const key = () => crypto.randomUUID();
export const stateWord = (s: string) =>
  ({
    HEARD: "Received",
    WORKING: "Working",
    AWAITING_APPROVAL: "Needs your review",
    COMPLETED: "Ready",
    FAILED: "Interrupted",
    CANCELLED: "Cancelled",
    NEEDS_INPUT: "Needs input",
  })[s] || s;
export const shortDate = (v: Date) =>
  v.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
export function PreviewNotice() {
  return PREVIEW ? (
    <div className="preview-notice" role="status">
      <Sparkles size={16} />
      <span>
        <strong>Interactive UI preview</strong> · Sample data. No models or
        backend.
        <span className="preview-more"> Changes reset on reload.</span>
      </span>
    </div>
  ) : null;
}
export function Mark() {
  return (
    <span className="mark" aria-hidden>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <path
          d="M6 26 16 6l10 20"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
export function Empty({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
