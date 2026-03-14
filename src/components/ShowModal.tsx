// ShowModal — overlay modal for detailed show information.
// Closes on Escape key press or click outside the card.
// Body scroll is locked while open.

import { useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { colors } from "@/styles/colors";
import { toEmbedUrl } from "@/lib/netticketUtils";

export type ShowPerformance = {
  date: string;  // "D.M.YYYY" format
  time?: string; // "HH:MM" format
  ticketUrl: string;
};

export type ShowInfo = {
  title: string;
  subtitle?: string;
  image?: string;       // path relative to /public, e.g. "/images/foo.jpg"
  description: string[];
  credits: string[]; // "Role: Name(s)" format
  extra?: string[];  // premiere, duration, age recommendation, etc.
  performances?: ShowPerformance[]; // all bookable dates for this show
};

type Props = {
  info: ShowInfo | null;
  onClose: () => void;
};

const BORDER_RADIUS = "16px";

export default function ShowModal({ info, onClose }: Props) {
  // Escape to close + body scroll lock
  useEffect(() => {
    if (!info) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [info, onClose]);

  if (!info) return null;

  return (
    // Backdrop — click to close, blurred background
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Card — outer clips scrollbar to rounded corners */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-enter"
        style={{
          maxWidth: "640px",
          width: "100%",
          borderRadius: BORDER_RADIUS,
          overflow: "clip",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.15)",
        }}
      >
      {/* Inner scrollable area */}
      <div
        className="modal-card"
        style={{
          backgroundColor: colors.white,
          maxHeight: "88vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "2.5rem",
          position: "relative",
        }}
      >
        {/* Close button — circular, sticky so it stays visible while scrolling */}
        <button
          onClick={onClose}
          aria-label="Sulje"
          style={{
            position: "sticky",
            top: 0,
            float: "right",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            backgroundColor: colors.brandFuchsia,
            color: colors.white,
            fontSize: "0.85rem",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            zIndex: 10,
            marginBottom: "-2rem",
            marginRight: "-1.25rem",
            marginTop: "-0.75rem",
          }}
        >
          ✕
        </button>

        {/* Hero image — bleeds to card edges with matching top radius */}
        {info.image && (
          <div
            style={{
              margin: "-2.5rem -2.5rem 1.75rem -2.5rem",
              overflow: "hidden",
              borderRadius: 0,
            }}
          >
            <Image
              src={info.image}
              alt={info.title}
              width={640}
              height={480}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
                objectPosition: "center 20%",
              }}
            />
          </div>
        )}

        {/* Title block */}
        <div
          style={{
            borderLeft: `3px solid ${colors.brandFuchsia}`,
            paddingLeft: "1rem",
            marginBottom: "1.75rem",
          }}
        >
          {info.subtitle && (
            <p
              style={{
                color: colors.brandFuchsia,
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}
            >
              {info.subtitle}
            </p>
          )}
          <h2
            style={{
              color: colors.nearBlack,
              fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1.2,
            }}
          >
            {info.title}
          </h2>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "1.75rem" }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p style={{ color: colors.nearBlack, fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "1rem" }}>
                  {children}
                </p>
              ),
              a: ({ href, children }) => {
                const isInternal = href?.startsWith("/") || href?.startsWith("#");
                return (
                  <a
                    href={href}
                    target={isInternal ? undefined : "_blank"}
                    rel={isInternal ? undefined : "noopener noreferrer"}
                    style={{ color: colors.brandFuchsia }}
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {info.description.join("\n\n")}
          </ReactMarkdown>
        </div>

        {/* Credits */}
        {info.credits.length > 0 && (
          <div
            style={{
              borderTop: `1px solid ${colors.borderLight}`,
              paddingTop: "1.25rem",
              marginBottom: info.extra ? "1.25rem" : 0,
            }}
          >
            {info.credits.map((credit, i) => {
              const colonIdx = credit.indexOf(":");
              const role =
                colonIdx > -1 ? credit.slice(0, colonIdx) : credit;
              const name =
                colonIdx > -1 ? credit.slice(colonIdx + 1).trim() : "";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginBottom: "0.4rem",
                    fontSize: "0.8rem",
                  }}
                >
                  <span
                    style={{
                      color: colors.muted,
                      flex: "1 1 0",
                    }}
                  >
                    {role}
                  </span>
                  <span style={{ color: colors.nearBlack, flex: "1 1 0" }}>{name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Extra info */}
        {info.extra && info.extra.length > 0 && (
          <div
            style={{
              borderTop: `1px solid ${colors.borderLight}`,
              paddingTop: "1.25rem",
              marginBottom: info.performances && info.performances.length > 0 ? "1.25rem" : 0,
            }}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p style={{ color: colors.muted, fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                    {children}
                  </p>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: colors.brandFuchsia }}>
                    {children}
                  </a>
                ),
              }}
            >
              {info.extra.join("\n\n")}
            </ReactMarkdown>
          </div>
        )}

        {/* Performances — all bookable dates for this show */}
        {info.performances && info.performances.length > 0 && (
          <div
            style={{
              borderTop: `1px solid ${colors.borderLight}`,
              paddingTop: "1.25rem",
            }}
          >
            <p
              style={{
                color: colors.muted,
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              Näytökset
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {info.performances.map((perf, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "rgba(17,17,17,0.035)",
                    borderRadius: "4px",
                    padding: "0.55rem 0.875rem",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      color: colors.nearBlack,
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  >
                    {perf.date}{perf.time ? ` · ${perf.time}` : ""}
                  </span>
                  <a
                    href={toEmbedUrl(perf.ticketUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: colors.brandFuchsia,
                      color: colors.white,
                      padding: "0.3rem 0.75rem",
                      borderRadius: "2px",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    Osta liput
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
