"use client";

import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>
          &copy; {new Date().getFullYear()} Neema Sadeghi. All rights reserved.
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
