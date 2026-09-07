"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WORK_NAV } from "@/lib/work-nav";
import { useLandingOverlayActive } from "@/hooks/useLandingOverlay";
import styles from "./Navbar.module.css";

const MOBILE_NAV_MQ = "(max-width: 768px)";

function subscribeMobileNav(cb: () => void) {
  const mq = window.matchMedia(MOBILE_NAV_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMobileNavSnapshot() {
  return window.matchMedia(MOBILE_NAV_MQ).matches;
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [retracted, setRetracted] = useState(false);
  const isMobileNav = useSyncExternalStore(
    subscribeMobileNav,
    getMobileNavSnapshot,
    () => false
  );

  useEffect(() => {
    if (retracted) {
      document.documentElement.setAttribute("data-header-retracted", "true");
    } else {
      document.documentElement.removeAttribute("data-header-retracted");
    }
  }, [retracted]);

  useEffect(
    () => () => {
      document.documentElement.removeAttribute("data-header-retracted");
    },
    []
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      setRetracted(false);
      return;
    }

    const sync = () => {
      const y = window.scrollY;
      setRetracted(y > 0.5 && !isMobileNav);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [menuOpen, isMobileNav]);

  useEffect(() => {
    if (!menuOpen || !isMobileNav) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, isMobileNav]);

  const toggleMenu = () => {
    setMenuOpen((open) => !open);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const linkClass = (href: string) =>
    `${styles.link} ${pathname === href ? styles.linkActive : ""}`;

  const isLanding = useLandingOverlayActive();

  return (
    <header
      className={`${styles.header} ${isLanding ? styles.headerLanding : ""} ${menuOpen ? styles.menuOpen : ""} ${retracted ? styles.retracted : ""}`}
    >
      <nav className={styles.nav}>
        <Link
          href="/"
          className={`${styles.logo} ${menuOpen ? styles.logoHidden : ""}`}
          onClick={closeMenu}
          tabIndex={menuOpen ? -1 : 0}
          aria-hidden={menuOpen}
        >
          sweetiepie
        </Link>

        <div
          className={`${styles.links} ${menuOpen ? styles.linksOpen : ""}`}
          aria-hidden={!menuOpen && isMobileNav}
        >
          {WORK_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClass(href)}
              onClick={closeMenu}
              tabIndex={menuOpen || !isMobileNav ? 0 : -1}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://instagram.com/sweetiepie.dir"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label="Instagram"
            onClick={closeMenu}
            tabIndex={menuOpen || !isMobileNav ? 0 : -1}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </a>
        </div>

        <button
          type="button"
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className={styles.burgerLine} />
          <span className={styles.burgerLine} />
        </button>
      </nav>
    </header>
  );
}
