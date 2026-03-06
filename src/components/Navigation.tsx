// Navigation component for Tanssiteatteri Rimpparemmi
// Fixed header: transparent on top, light on scroll.
// Includes FI/EN locale switcher, Rimpparemmi dropdown, fuchsia ticket button, mobile hamburger.

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { colors } from "@/styles/colors";

type Locale = "fi" | "en";

const labels = {
  fi: {
    home: "Etusivu",
    programme: "Ohjelmisto",
    tickets: "Kalenteri & liput",
    rimpparemmi: "Rimpparemmi",
    about: "Tanssiteatteri",
    people: "Ihmiset",
    venue: "Kulttuuritalo Wiljami",
    contact: "Yhteystiedot",
    media: "Media",
    tourProgramme: "Kiertueohjelmisto",
    arrival: "Saapuminen",
    openMenu: "Avaa valikko",
    closeMenu: "Sulje valikko",
    langFull: "Suomi",
    langFullEn: "English",
  },
  en: {
    home: "Home",
    programme: "Programme",
    tickets: "Calendar & tickets",
    rimpparemmi: "Rimpparemmi",
    about: "Dance Theatre",
    people: "People",
    venue: "Culture House Wiljami",
    contact: "Contact",
    media: "Media",
    tourProgramme: "Tour Programme",
    arrival: "Getting here",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    langFull: "Suomi",
    langFullEn: "English",
  },
} as const;

export default function Navigation() {
  const router = useRouter();
  const locale = (router.locale ?? "fi") as Locale;
  const t = labels[locale];

  const isHomePage = router.pathname === "/";
  const [navOpacity, setNavOpacity] = useState(isHomePage ? 0 : 1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [programmeDropdownOpen, setProgrammeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const programmeDropdownRef = useRef<HTMLDivElement>(null);

  // Fade nav background from transparent (at 200px) to solid (at 500px) — homepage only
  useEffect(() => {
    if (!isHomePage) return;
    const handleScroll = () => {
      const fadeStart = 200;
      const fadeEnd = 500;
      const scrollY = window.scrollY;
      const opacity = Math.min(
        1,
        Math.max(0, (scrollY - fadeStart) / (fadeEnd - fadeStart))
      );
      setNavOpacity(opacity);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (programmeDropdownRef.current && !programmeDropdownRef.current.contains(e.target as Node)) {
        setProgrammeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setProgrammeDropdownOpen(false);
  }, [router.asPath]);

  const switchLocale = (newLocale: Locale) => {
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  // Interpolate nav text: white (transparent) → nearBlack (solid), in sync with navOpacity
  // #ffffff = rgb(255,255,255), nearBlack = rgb(17,17,17) → channel moves 255→17
  const textChannel = Math.round(255 - 238 * navOpacity);
  const navTextColor = `rgb(${textChannel},${textChannel},${textChannel})`;

  // Shared style objects
  const linkStyle: React.CSSProperties = {
    color: navTextColor,
    fontSize: "0.875rem",
    letterSpacing: "0.05em",
    cursor: "pointer",
  };

  // Dropdown links always sit on a light background — keep them dark
  const dropdownLinkStyle: React.CSSProperties = {
    ...linkStyle,
    color: colors.nearBlack,
    display: "block",
    padding: "0.6rem 1.25rem",
  };

  // Mobile menu links — always dark (white panel background)
  const mobileLinkStyle: React.CSSProperties = {
    ...linkStyle,
    color: colors.nearBlack,
  };

  const mobileLocaleBtnStyle = (active: boolean): React.CSSProperties => ({
    ...localeBtnStyle(active),
    color: colors.nearBlack,
  });

  const ticketsBtnStyle: React.CSSProperties = {
    backgroundColor: colors.brandFuchsia,
    color: colors.white,
    padding: "0.5rem 1rem",
    borderRadius: "2px",
    fontSize: "0.875rem",
    letterSpacing: "0.05em",
    fontWeight: 600,
    transition: "background-color 0.2s",
    whiteSpace: "nowrap",
  };

  const iconBtnStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
  };

  const localeBtnStyle = (active: boolean): React.CSSProperties => ({
    ...iconBtnStyle,
    color: navTextColor,
    fontWeight: active ? 700 : 400,
    opacity: active ? 1 : 0.55,
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
  });

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: `rgba(232,232,232,${navOpacity})`,
        borderBottom: `1px solid rgba(224,224,224,${navOpacity})`,
        padding: "0 2rem",
        height: "96px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center" }}>
        <Image
          src="/images/RRemmi_FUKS_rgb_10Mt.jpeg"
          alt="Tanssiteatteri Rimpparemmi"
          width={80}
          height={80}
          priority
          style={{ borderRadius: "2px" }}
        />
      </Link>

      {/* Desktop nav */}
      <div
        className="desktop-nav"
        style={{ alignItems: "center", gap: "1.75rem" }}
      >
        <Link href="/" style={linkStyle}>
          {t.home}
        </Link>

        {/* Programme dropdown */}
        <div ref={programmeDropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setProgrammeDropdownOpen(!programmeDropdownOpen)}
            aria-expanded={programmeDropdownOpen}
            style={{
              ...linkStyle,
              ...iconBtnStyle,
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            {t.programme}
            <span style={{ fontSize: "0.55rem", opacity: 0.7 }}>&#9660;</span>
          </button>

          {programmeDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 0.75rem)",
                left: 0,
                backgroundColor: colors.offWhite,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: "2px",
                minWidth: "220px",
                padding: "0.5rem 0",
              }}
            >
              <Link href="/ohjelma" style={dropdownLinkStyle}>
                {t.programme}
              </Link>
              <Link href="/kiertueohjelmisto" style={dropdownLinkStyle}>
                {t.tourProgramme}
              </Link>
            </div>
          )}
        </div>

        <Link href="/saapuminen" style={linkStyle}>
          {t.arrival}
        </Link>

        <Link href="/kalenteri" style={ticketsBtnStyle}>
          {t.tickets}
        </Link>

        {/* Rimpparemmi dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            style={{
              ...linkStyle,
              ...iconBtnStyle,
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            {t.rimpparemmi}
            <span style={{ fontSize: "0.55rem", opacity: 0.7 }}>&#9660;</span>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 0.75rem)",
                right: 0,
                backgroundColor: colors.offWhite,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: "2px",
                minWidth: "210px",
                padding: "0.5rem 0",
              }}
            >
              <Link href="/tanssiteatteri" style={dropdownLinkStyle}>
                {t.about}
              </Link>
              <Link href="/ihmiset" style={dropdownLinkStyle}>
                {t.people}
              </Link>
            </div>
          )}
        </div>

        <Link href="/yhteystiedot" style={linkStyle}>
          {t.contact}
        </Link>

        <Link href="/media" style={linkStyle}>
          {t.media}
        </Link>

        {/* Locale switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <button onClick={() => switchLocale("fi")} style={localeBtnStyle(locale === "fi")}>
            FI
          </button>
          <span style={{ color: navTextColor, fontSize: "0.75rem", opacity: 0.4 }}>|</span>
          <button onClick={() => switchLocale("en")} style={localeBtnStyle(locale === "en")}>
            EN
          </button>
        </div>
      </div>

      {/* Mobile hamburger button */}
      <button
        className="hamburger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? t.closeMenu : t.openMenu}
        style={{
          ...iconBtnStyle,
          color: navTextColor,
          fontSize: "1.5rem",
          lineHeight: 1,
        }}
      >
        {menuOpen ? "\u2715" : "\u2630"}
      </button>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "96px",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.offWhite,
            display: "flex",
            flexDirection: "column",
            padding: "2rem",
            gap: "1.5rem",
            overflowY: "auto",
          }}
        >
          <Link href="/" style={{ ...mobileLinkStyle, fontSize: "1.1rem" }}>
            {t.home}
          </Link>

          <Link href="/ohjelma" style={{ ...mobileLinkStyle, fontSize: "1.1rem" }}>
            {t.programme}
          </Link>
          <Link href="/kiertueohjelmisto" style={{ ...mobileLinkStyle, fontSize: "1rem", paddingLeft: "0.75rem", opacity: 0.75 }}>
            {t.tourProgramme}
          </Link>

          <Link href="/saapuminen" style={{ ...mobileLinkStyle, fontSize: "1.1rem" }}>
            {t.arrival}
          </Link>

          <Link
            href="/kalenteri"
            style={{ ...ticketsBtnStyle, textAlign: "center", padding: "0.75rem 1rem" }}
          >
            {t.tickets}
          </Link>

          <hr style={{ borderColor: colors.borderLight, borderTop: "none" }} />

          <Link href="/tanssiteatteri" style={{ ...mobileLinkStyle, fontSize: "1rem" }}>
            {t.about}
          </Link>
          <Link href="/ihmiset" style={{ ...mobileLinkStyle, fontSize: "1rem" }}>
            {t.people}
          </Link>

          <hr style={{ borderColor: colors.borderLight, borderTop: "none" }} />

          <Link href="/yhteystiedot" style={{ ...mobileLinkStyle, fontSize: "1rem" }}>
            {t.contact}
          </Link>
          <Link href="/media" style={{ ...mobileLinkStyle, fontSize: "1rem" }}>
            {t.media}
          </Link>

          {/* Locale switcher at bottom */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
            <button
              onClick={() => switchLocale("fi")}
              style={{ ...mobileLocaleBtnStyle(locale === "fi"), fontSize: "0.875rem" }}
            >
              {t.langFull}
            </button>
            <span style={{ color: colors.muted }}>|</span>
            <button
              onClick={() => switchLocale("en")}
              style={{ ...mobileLocaleBtnStyle(locale === "en"), fontSize: "0.875rem" }}
            >
              {t.langFullEn}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
