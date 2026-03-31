"use client";

import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [clipPercent, setClipPercent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      const contact = document.getElementById("about");
      if (contact) {
        const rect = contact.getBoundingClientRect();
        const headerH = 70;
        if (rect.top <= headerH) {
          const pct = Math.min(100, ((headerH - rect.top) / headerH) * 100);
          setClipPercent(pct);
          if (!dark) setDark(true);
        } else {
          setClipPercent(0);
          if (dark) setDark(false);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string, path: string) => {
    setMenuOpen(false);
    document.body.style.overflow = "";
    window.history.pushState(null, "", path);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = "";
  };

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.style.overflow = next ? "hidden" : "";
  };

  return (
    <div className={styles.headerWrap}>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <nav className={styles.nav}>
          <button
            className={styles.logoWrap}
            onClick={() => {
              window.history.pushState(null, "", "/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className={styles.logo}>Neema Sadeghi</span>
            <span className={styles.role}>Director of Photography</span>
          </button>
          <button
            className={`${styles.toggle} ${menuOpen ? styles.toggleActive : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
          </button>
          <ul className={`${styles.links} ${menuOpen ? styles.linksOpen : ""}`}>
            <li><button className={styles.link} onClick={() => scrollTo("work", "/")}>Work</button></li>
            <li><button className={styles.link} onClick={() => scrollTo("contact", "/contact")}>Contact</button></li>
          </ul>
        </nav>
      </header>
      {dark && (
        <header
          className={`${styles.header} ${styles.scrolled} ${styles.dark}`}
          style={{ clipPath: menuOpen ? "none" : `inset(${100 - clipPercent}% 0 0 0)` }}
          aria-hidden={!menuOpen}
        >
          <nav className={styles.nav}>
            <button
              className={styles.logoWrap}
              onClick={() => {
                window.history.pushState(null, "", "/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span className={styles.logo}>Neema Sadeghi</span>
              <span className={styles.role}>Director of Photography</span>
            </button>
            <button
              className={`${styles.toggle} ${menuOpen ? styles.toggleActive : ""}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              tabIndex={-1}
            >
              <span />
              <span />
            </button>
            <ul className={`${styles.links} ${menuOpen ? styles.linksOpen : ""}`}>
              <li><button className={styles.link} onClick={() => scrollTo("work", "/")}>Work</button></li>
              <li><button className={styles.link} onClick={() => scrollTo("contact", "/contact")}>Contact</button></li>
            </ul>
          </nav>
        </header>
      )}
    </div>
  );
}
