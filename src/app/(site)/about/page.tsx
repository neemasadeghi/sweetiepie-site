import Image from "next/image";
import { getAbout } from "@/lib/sanity-queries";
import styles from "./about.module.css";

export const metadata = {
  title: "About — Neema Sadeghi",
};

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <section className={styles.about}>
      <div className={styles.inner}>
        <div className={styles.imageCol}>
          <div className={styles.imageWrap}>
            <Image
              src={about.portraitUrl}
              alt="Neema Sadeghi"
              fill
              sizes="(max-width: 1024px) 400px, 40vw"
              className={styles.portrait}
            />
          </div>
        </div>
        <div className={styles.textCol}>
          <span className={styles.label}>About</span>
          <h1 className={styles.heading}>{about.heading}</h1>
          <div className={styles.bio}>
            {about.bio.map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className={styles.stats}>
            {about.stats.map((stat: { number: string; label: string }, i: number) => (
              <div key={i} className={styles.stat}>
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
