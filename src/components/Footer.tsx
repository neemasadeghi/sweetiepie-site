"use client";

import { usePathname } from "next/navigation";
import { useLandingOverlayActive } from "@/hooks/useLandingOverlay";
import styles from "./Footer.module.css";

export function Footer() {
  const pathname = usePathname();
  const landingOverlay = useLandingOverlayActive();

  if (landingOverlay) return null;

  const isWorkHome = pathname === "/" || pathname === "/work";

  return (
    <footer
      className={`${styles.footer} ${isWorkHome ? styles.footerHome : ""}`}
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
