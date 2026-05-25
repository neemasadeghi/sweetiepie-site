"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WORK_NAV } from "@/lib/work-nav";
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
    if (menuOpen) {
      setRetracted(false);
      return;
    }

    const sync = () => {
      const y = window.scrollY;
      // Hiding the bar on scroll also disables the burger (pointer-events: none). Keep the header
      // visible on small screens so the menu is always reachable.
      setRetracted(y > 0.5 && !isMobileNav);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [menuOpen, isMobileNav]);

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.style.overflow = next ? "hidden" : "";
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = "";
  };

  const linkClass = (href: string) =>
    `${styles.link} ${pathname === href ? styles.linkActive : ""}`;

  return (
    <header
      className={`${styles.header} ${retracted ? styles.retracted : ""}`}
    >
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          sweetiepie
        </Link>

        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>

        <div className={`${styles.links} ${menuOpen ? styles.linksOpen : ""}`}>
          {WORK_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClass(href)}
              onClick={closeMenu}
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
      </nav>
    </header>
  );
}
