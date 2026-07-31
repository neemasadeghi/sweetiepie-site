import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/sanity-queries";
import { ProjectBackLink } from "@/components/ProjectBackLink";
import styles from "./project.module.css";

function parseVimeoUrl(url: string): { id: string; hash?: string } | null {
  const match = url.match(/vimeo\.com\/(\d+)(?:\/([a-f0-9]+))?/);
  return match ? { id: match[1], hash: match[2] } : null;
}

async function getVimeoEmbed(url: string) {
  const parsed = parseVimeoUrl(url);
  if (!parsed) return null;

  const hash = parsed.hash ? `&h=${parsed.hash}` : "";
  const embedUrl = `https://player.vimeo.com/video/${parsed.id}?title=0&byline=0&portrait=0${hash}`;

  try {
    const oembedUrl = parsed.hash
      ? `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${parsed.id}/${parsed.hash}`
      : `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${parsed.id}`;
    const res = await fetch(oembedUrl, { next: { revalidate: 86400 } });
    if (res.ok) {
      const data = await res.json();
      return { embedUrl, width: data.width, height: data.height };
    }
  } catch {}

  return { embedUrl, width: 16, height: 9 };
}

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const vimeo = project.vimeoUrl ? await getVimeoEmbed(project.vimeoUrl) : null;

  const additionalEmbeds = await Promise.all(
    (project.additionalVideos || []).map(async (v) => ({
      title: v.title,
      embed: await getVimeoEmbed(v.url),
    }))
  );

  return (
    <section className={styles.page}>
      <div className={styles.top}>
        <ProjectBackLink className={styles.back} />
      </div>

      <div className={styles.details}>
        <div className={styles.titleBlock}>
          <h1 className={styles.client}>{project.client}</h1>
          {(project.subtitle || project.format) && (
            <span className={styles.subtitle}>
              {[project.subtitle, project.format].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
        <div className={styles.meta}>
          {project.director && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Director</span>
              <span className={styles.metaValue}>{project.director}</span>
            </div>
          )}
          {project.cinematographer && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Cinematographer</span>
              <span className={styles.metaValue}>{project.cinematographer}</span>
            </div>
          )}
          {project.production && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Production</span>
              <span className={styles.metaValue}>{project.production}</span>
            </div>
          )}
          {project.imdbUrl && (
            <a href={project.imdbUrl} target="_blank" rel="noopener noreferrer" className={styles.imdbLink} aria-label="IMDb">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M2 4v16h3.5V4H2zm4.5 0v16h3l.3-4.3.4-3.3.3 3.3.3 4.3h3V4h-3l-.5 7.5L9.8 4H6.5zM14 4v16h3.5v-5.7l.8 0c1.3 0 2.3-.4 3-1.1.7-.8 1-1.8 1-3.1V9.2c0-1.5-.3-2.7-1-3.5-.7-.8-1.7-1.3-3-1.5L14 4zm3.5 3h.3c.4 0 .6.1.8.4.2.3.3.7.3 1.3v2.1c0 .6-.1 1-.3 1.2-.2.3-.5.4-.8.4h-.3V7z"/></svg>
            </a>
          )}
          {project.watchUrl && project.watchPlatform && (
            <a href={project.watchUrl} target="_blank" rel="noopener noreferrer" className={styles.watchLink}>
              Watch on {project.watchPlatform}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {vimeo && (
        <div>
          {project.vimeoTitle && (
            <h2 className={styles.videoTitle}>{project.vimeoTitle}</h2>
          )}
          <div className={styles.playerWrap}>
            <iframe
              src={vimeo.embedUrl}
              className={styles.player}
              style={{ aspectRatio: `${vimeo.width} / ${vimeo.height}` }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {additionalEmbeds.length > 0 && (
        <div className={styles.additionalVideos}>
          {additionalEmbeds.map((v, i) => (
            <div key={i} className={styles.additionalVideo}>
              {v.title && <h2 className={styles.additionalTitle}>{v.title}</h2>}
              {v.embed && (
                <div className={styles.playerWrap}>
                  <iframe
                    src={v.embed.embedUrl}
                    className={styles.player}
                    style={{ aspectRatio: `${v.embed.width} / ${v.embed.height}` }}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {project.gallery && project.gallery.length > 0 && (
        <div className={styles.gallery}>
          {project.gallery.map((item, i) => (
            <figure key={i} className={styles.galleryItem}>
              {item.link ? (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.galleryLink}>
                  <img src={item.imageUrl} alt={item.caption || project.client} className={styles.galleryImage} />
                  <span className={styles.linkBadge}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </span>
                </a>
              ) : (
                <img src={item.imageUrl} alt={item.caption || project.client} className={styles.galleryImage} />
              )}
              {item.caption && (
                <figcaption className={styles.galleryCaption}>{item.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
