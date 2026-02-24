// CalendarWidget — monthly calendar with event day highlights
// Highlighted days are clickable and reveal event details + ticket link below the grid.
// Events come as props; will be driven by CMS data via getStaticProps in future.

import { useState } from "react";
import Link from "next/link";
import { colors } from "@/styles/colors";

export type CalendarEvent = {
  date: string; // "D.M.YYYY" format, e.g. "15.3.2026"
  time?: string; // "HH:MM" format, e.g. "19:00"
  title: string;
  venue: string;
  ticketUrl: string;
};

type Props = {
  events: CalendarEvent[];
  locale: "fi" | "en";
  calendarTitle: string;
  buyTickets: string;
  onShowInfo?: (title: string) => void;
  hideTitle?: boolean;
};

const MONTH_NAMES = {
  fi: [
    "Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu",
    "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu",
    "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu",
  ],
  en: [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ],
} as const;

const DAY_NAMES = {
  fi: ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
} as const;

const parseEventDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split(".").map(Number);
  return new Date(year, month - 1, day);
};

// Convert JS getDay() (0=Sun) to Monday-first index (0=Mon, 6=Sun)
const toMondayFirst = (jsDay: number): number => (jsDay + 6) % 7;

export default function CalendarWidget({
  events,
  locale,
  calendarTitle,
  buyTickets,
  onShowInfo,
  hideTitle = false,
}: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = toMondayFirst(new Date(year, month, 1).getDay());

  // Map day-of-month → events for the currently viewed month
  const eventsByDay = new Map<number, CalendarEvent[]>();
  for (const event of events) {
    const d = parseEventDate(event.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      eventsByDay.set(day, [...(eventsByDay.get(day) ?? []), event]);
    }
  }

  const goToPrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    if (!eventsByDay.has(day)) return;
    setSelectedDay(selectedDay === day ? null : day);
  };

  const isToday = (day: number): boolean =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  // Grid cells: null = empty padding slot, number = day of month
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedEvents =
    selectedDay !== null ? (eventsByDay.get(selectedDay) ?? []) : [];

  const navBtnStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: colors.nearBlack,
    fontSize: "1.5rem",
    lineHeight: 1,
    padding: "0.25rem 0.5rem",
  };

  return (
    <div>
      {!hideTitle && (
        <h2
          style={{
            color: colors.nearBlack,
            fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          {calendarTitle}
        </h2>
      )}

      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <button onClick={goToPrevMonth} aria-label="Previous month" style={navBtnStyle}>
          ‹
        </button>
        <span
          style={{
            color: colors.nearBlack,
            fontSize: "0.875rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {MONTH_NAMES[locale][month]} {year}
        </span>
        <button onClick={goToNextMonth} aria-label="Next month" style={navBtnStyle}>
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
          marginBottom: "4px",
        }}
      >
        {DAY_NAMES[locale].map((name) => (
          <div
            key={name}
            style={{
              textAlign: "center",
              color: colors.muted,
              fontSize: "0.65rem",
              letterSpacing: "0.06em",
              padding: "0.25rem 0",
            }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
        }}
      >
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const hasEvent = eventsByDay.has(day);
          const isSelected = selectedDay === day;
          const todayMark = isToday(day);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={!hasEvent}
              style={{
                background: isSelected
                  ? colors.brandFuchsia
                  : hasEvent
                  ? "rgba(232,23,93,0.12)"
                  : "transparent",
                border: todayMark
                  ? `1px solid ${colors.muted}`
                  : hasEvent && !isSelected
                  ? "1px solid rgba(232,23,93,0.35)"
                  : "1px solid transparent",
                borderRadius: "2px",
                cursor: hasEvent ? "pointer" : "default",
                color: isSelected
                  ? colors.white
                  : hasEvent
                  ? colors.brandFuchsia
                  : colors.nearBlack,
                fontSize: "0.8rem",
                fontWeight: hasEvent ? 700 : 400,
                padding: "0.45rem 0",
                textAlign: "center",
                transition: "background 0.15s",
                opacity: !hasEvent ? 0.5 : 1,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Event details for selected day */}
      {selectedDay !== null && selectedEvents.length > 0 && (
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {selectedEvents.map((event, i) => (
            <div
              key={i}
              style={{
                backgroundColor: colors.white,
                borderLeft: `3px solid ${colors.brandFuchsia}`,
                padding: "0.875rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div>
                <p
                  style={{
                    color: colors.nearBlack,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    marginBottom: "0.2rem",
                  }}
                >
                  {event.title}
                </p>
                <p style={{ color: colors.muted, fontSize: "0.75rem" }}>
                  {event.date}{event.time ? ` ${event.time}` : ""}&nbsp;&middot;&nbsp;{event.venue}
                </p>
                {onShowInfo && (
                  <button
                    onClick={() => onShowInfo(event.title)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: colors.brandFuchsia,
                      fontSize: "0.65rem",
                      letterSpacing: "0.05em",
                      padding: 0,
                      marginTop: "0.25rem",
                    }}
                  >
                    Lue lisää →
                  </button>
                )}
              </div>
              <Link
                href={event.ticketUrl}
                style={{
                  backgroundColor: colors.brandFuchsia,
                  color: colors.white,
                  padding: "0.4rem 0.875rem",
                  borderRadius: "2px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {buyTickets}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
