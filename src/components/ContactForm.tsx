"use client";

import { useState } from "react";
import styles from "./ContactForm.module.css";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      (e.target as HTMLFormElement).reset();
    }, 3000);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.group}>
        <label htmlFor="name" className={styles.label}>Name</label>
        <input type="text" id="name" name="name" className={styles.input} required autoComplete="name" />
      </div>
      <div className={styles.group}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input type="email" id="email" name="email" className={styles.input} required autoComplete="email" />
      </div>
      <div className={styles.group}>
        <label htmlFor="project-type" className={styles.label}>Project Type</label>
        <select id="project-type" name="project-type" className={`${styles.input} ${styles.select}`}>
          <option value="" disabled>Select a category</option>
          <option value="music-video">Music Video</option>
          <option value="commercial">Commercial</option>
          <option value="narrative">Narrative Film</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className={styles.group}>
        <label htmlFor="message" className={styles.label}>Message</label>
        <textarea id="message" name="message" className={`${styles.input} ${styles.textarea}`} rows={5} required />
      </div>
      <button type="submit" className={styles.submit} disabled={submitted}>
        <span>{submitted ? "Message Sent!" : "Send Message"}</span>
        {!submitted && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </button>
    </form>
  );
}
