"use client";

import type { ReactNode } from "react";
import styles from "./LandingHero.module.css";

type LandingHeroProps = {
  revealed: boolean;
  onReveal: () => void;
  video: ReactNode;
};

export function LandingHero({ revealed, onReveal, video }: LandingHeroProps) {
  return (
    <button
      type="button"
      className={`${styles.hero} ${revealed ? styles.heroDismissed : ""}`}
      onClick={revealed ? undefined : onReveal}
      aria-label={revealed ? undefined : "Enter sweetiepie"}
      tabIndex={revealed ? -1 : 0}
      disabled={revealed}
    >
      <div className={styles.media}>{video}</div>
      <div className={styles.scrim} aria-hidden />
      <div className={styles.content}>
        <h1 className={styles.title}>sweetiepie</h1>
        <span className={styles.hint}>Click to enter</span>
      </div>
    </button>
  );
}
