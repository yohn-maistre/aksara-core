import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { useMemo, useState } from "react";
import { useWorkspace } from "./state";
export const localDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
/** A view of the latest authorized work snapshots, not a fabricated productivity score. */
export function ActivityCalendar() {
  const { timeline, at, setAt, navigate } = useWorkspace();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const counts = useMemo(() => {
    const result = new Map<string, number>();
    for (const row of timeline) {
      if (!Number.isFinite(row.recorded_ms)) continue;
      const date = localDay(new Date(row.recorded_ms));
      result.set(date, (result.get(date) || 0) + 1);
    }
    return result;
  }, [timeline]);
  const now = new Date(),
    today = localDay(now);
  const total = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const offset = (month.getDay() + 6) % 7;
  const label = month.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const move = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  return (
    <section className="activity-calendar" aria-label="Recorded work calendar">
      <div className="calendar-heading">
        <h2>{label}</h2>
        <div>
          <button
            className="icon-button"
            aria-label="Previous month"
            onClick={() => move(-1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Next month"
            disabled={
              month.getFullYear() === now.getFullYear() &&
              month.getMonth() === now.getMonth()
            }
            onClick={() => move(1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="calendar-weekdays" aria-hidden>
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <span key={index}>{day}</span>
        ))}
      </div>
      <div className="calendar-days">
        {Array.from({ length: offset }, (_, i) => (
          <span key={`space-${i}`} aria-hidden />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const date = new Date(month.getFullYear(), month.getMonth(), i + 1),
            value = localDay(date),
            count = counts.get(value) || 0;
          return (
            <button
              key={value}
              type="button"
              disabled={value > today}
              className={`calendar-day ${value === today ? "is-today" : ""}`}
              data-level={Math.min(count, 3)}
              aria-pressed={at === value}
              aria-label={`${date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}: ${count} recent work ${count === 1 ? "update" : "updates"}`}
              title={`${count} recent work updates`}
              onClick={() => {
                setAt(value);
                navigate("Today");
              }}
            >
              <span>{i + 1}</span>
            </button>
          );
        })}
      </div>
      <details className="calendar-note">
        <summary>
          <History size={12} />
          Recent work
        </summary>
        <p>
          Latest updates for up to 100 currently visible work items. Select a
          day to inspect recorded work. This is not a complete activity archive.
        </p>
      </details>
    </section>
  );
}
