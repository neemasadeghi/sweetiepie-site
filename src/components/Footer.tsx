"use client";

import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";

export function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer
      className={`${styles.footer} ${isHome ? styles.footerHome : ""}`}
    >
      <div className={styles.inner}>
        <span className={styles.copy}>
          &copy; {new Date().getFullYear()} sweetiepie
        </span>
        <button
          className={styles.top}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back to top
        </button>
      </div>
    </footer>
  );
}
