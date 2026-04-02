import { getContact } from "@/lib/sanity-queries";
import { ContactForm } from "@/components/ContactForm";
import styles from "./contact.module.css";

export const metadata = {
  title: "Contact — sweetiepie",
};

export default async function ContactPage() {
  const contact = await getContact();

  return (
    <section className={styles.contact}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <span className={styles.label}>Contact</span>
          <h1 className={styles.heading}>
            Let&apos;s create<br />something together
          </h1>
          <p className={styles.subtext}>
            Whether you have a project in mind or just want to connect,
            I&apos;d love to hear from you.
          </p>
          <div className={styles.details}>
            <a href={`mailto:${contact.email}`} className={styles.detailLink}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{contact.email}</span>
            </a>
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className={styles.detailLink}>
                <span className={styles.detailLabel}>Phone</span>
                <span className={styles.detailValue}>{contact.phone}</span>
              </a>
            )}
            <div className={styles.detailLink}>
              <span className={styles.detailLabel}>Based in</span>
              <span className={styles.detailValue}>{contact.location}</span>
            </div>
          </div>
          <div className={styles.socials}>
            {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
            )}
            {contact.vimeo && (
              <a href={contact.vimeo} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Vimeo">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 7.42c-.1 2.13-1.58 5.05-4.45 8.76C14.6 19.94 12.13 22 10.1 22c-1.26 0-2.32-1.16-3.18-3.48L5.1 12.2C4.48 9.88 3.82 8.72 3.1 8.72c-.16 0-.71.33-1.66 1l-1-1.28C1.56 7.45 2.68 6.45 3.78 5.46 5.24 4.18 6.33 3.5 7.05 3.44c1.87-.18 3.02 1.1 3.45 3.84.47 2.96.79 4.8.97 5.52.54 2.44 1.13 3.66 1.77 3.66.5 0 1.25-.79 2.25-2.38.99-1.58 1.53-2.79 1.6-3.63.14-1.38-.4-2.07-1.62-2.07-.58 0-1.17.13-1.78.4 1.18-3.87 3.44-5.75 6.78-5.63 2.48.08 3.65 1.68 3.53 4.27z"/></svg>
              </a>
            )}
            {contact.imdb && (
              <a href={contact.imdb} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="IMDb">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 4v16h3.5V4H2zm4.5 0v16h3l.3-4.3.4-3.3.3 3.3.3 4.3h3V4h-3l-.5 7.5L9.8 4H6.5zM14 4v16h3.5v-5.7l.8 0c1.3 0 2.3-.4 3-1.1.7-.8 1-1.8 1-3.1V9.2c0-1.5-.3-2.7-1-3.5-.7-.8-1.7-1.3-3-1.5L14 4zm3.5 3h.3c.4 0 .6.1.8.4.2.3.3.7.3 1.3v2.1c0 .6-.1 1-.3 1.2-.2.3-.5.4-.8.4h-.3V7z"/></svg>
              </a>
            )}
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
