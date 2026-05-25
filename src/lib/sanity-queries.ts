import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { resolvePublicSanityProjectId } from "@/lib/sanity-public-project";
import { placeholderProjects } from "./placeholder-data";
import type { Project } from "@/components/ProjectCard";

const DEFAULT_DIRECTOR = "sweetiepie";
const DEFAULT_CINEMATOGRAPHER = "Neema Sadeghi";

function withDirectorDefault(value: string | undefined | null) {
  const t = value?.trim();
  return t || DEFAULT_DIRECTOR;
}

function withCinematographerDefault(value: string | undefined | null) {
  const t = value?.trim();
  return t || DEFAULT_CINEMATOGRAPHER;
}

const isSanityConfigured = !!resolvePublicSanityProjectId();

export async function getProjects(): Promise<Project[] | null> {
  if (!isSanityConfigured || !client) return placeholderProjects;

  let raw;
  try {
    raw = await client.fetch(
      `*[_type == "project"] | order(orderRank asc) {
        _id,
        client,
        subtitle,
        format,
        "slug": slug.current,
        category,
        still,
        "videoUrl": previewVideo.asset->url,
        vimeoUrl,
        director,
        cinematographer,
        production
      }`
    );
  } catch {
    return placeholderProjects;
  }

  if (!raw || raw.length === 0) return placeholderProjects;

  return raw.map((p: any) => ({
    _id: p._id,
    client: p.client,
    subtitle: p.subtitle || "",
    format: p.format || "",
    slug: p.slug,
    category: p.category || [],
    stillUrl: urlFor(p.still).width(1800).height(1259).fit("crop").quality(90).url(),
    hotspot: p.still?.hotspot ? { x: p.still.hotspot.x, y: p.still.hotspot.y } : undefined,
    videoUrl: p.videoUrl || "",
    vimeoUrl: p.vimeoUrl || "",
    director: withDirectorDefault(p.director),
    cinematographer: withCinematographerDefault(p.cinematographer),
    production: p.production,
  }));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isSanityConfigured || !client) {
    return placeholderProjects.find((p) => p.slug === slug) || null;
  }

  let raw;
  try {
    raw = await client.fetch(
      `*[_type == "project" && slug.current == $slug][0] {
        _id,
        client,
        subtitle,
        format,
        "slug": slug.current,
        category,
        still,
        "videoUrl": previewVideo.asset->url,
        vimeoTitle,
        vimeoUrl,
        additionalVideos[] { title, url },
        gallery[] { image, caption, link },
        director,
        cinematographer,
        production,
        imdbUrl,
        watchPlatform,
        watchUrl
      }`,
      { slug }
    );
  } catch {
    return null;
  }

  if (!raw) return null;

  return {
    _id: raw._id,
    client: raw.client,
    subtitle: raw.subtitle || "",
    format: raw.format || "",
    slug: raw.slug,
    category: raw.category || [],
    stillUrl: urlFor(raw.still).width(1800).height(1259).fit("crop").quality(90).url(),
    hotspot: raw.still?.hotspot ? { x: raw.still.hotspot.x, y: raw.still.hotspot.y } : undefined,
    videoUrl: raw.videoUrl || "",
    vimeoTitle: raw.vimeoTitle || "",
    vimeoUrl: raw.vimeoUrl || "",
    additionalVideos: raw.additionalVideos || [],
    gallery: (raw.gallery || []).map((g: any) => ({
      imageUrl: urlFor(g.image).width(1800).quality(90).url(),
      caption: g.caption || "",
      link: g.link || "",
    })),
    director: withDirectorDefault(raw.director),
    cinematographer: withCinematographerDefault(raw.cinematographer),
    production: raw.production,
    imdbUrl: raw.imdbUrl || "",
    watchPlatform: raw.watchPlatform || "",
    watchUrl: raw.watchUrl || "",
  };
}

export async function getAbout() {
  if (!isSanityConfigured || !client) {
    return {
      portraitUrl: "https://images.unsplash.com/photo-1607112810553-542bdeaa77c3?w=600&h=800&fit=crop",
      heading: "Crafting stories through light",
      bio: [
        "I'm a cinematographer based in Los Angeles with a passion for visual storytelling that moves audiences. My work spans music videos, commercials, and narrative films — each project an opportunity to find the emotional truth of a story through light, movement, and composition.",
        "With over a decade behind the lens, I've collaborated with artists, brands, and directors who share a commitment to pushing creative boundaries. I believe every frame should feel intentional, every shadow should have purpose, and every shot should serve the story.",
        "When I'm not on set, you'll find me studying the masters — from Storaro to Deakins — and exploring new techniques that blend classic cinematography with modern innovation.",
      ],
      stats: [
        { number: "10+", label: "Years Experience" },
        { number: "80+", label: "Projects Completed" },
        { number: "30+", label: "Collaborators" },
      ],
    };
  }

  let raw;
  try {
    raw = await client.fetch(
      `*[_type == "about"][0] {
        heading,
        portrait,
        bio,
        stats
      }`
    );
  } catch {
    raw = null;
  }

  if (!raw) {
    return {
      portraitUrl: "https://images.unsplash.com/photo-1607112810553-542bdeaa77c3?w=600&h=800&fit=crop",
      heading: "Crafting stories through light",
      bio: [
        "I'm a cinematographer based in Los Angeles with a passion for visual storytelling that moves audiences. My work spans music videos, commercials, and narrative films — each project an opportunity to find the emotional truth of a story through light, movement, and composition.",
      ],
      stats: [
        { number: "10+", label: "Years Experience" },
        { number: "80+", label: "Projects Completed" },
        { number: "30+", label: "Collaborators" },
      ],
    };
  }

  const bioBlocks = (raw.bio || [])
    .filter((b: any) => b._type === "block")
    .map((b: any) =>
      b.children.map((c: any) => c.text).join("")
    );

  return {
    portraitUrl: urlFor(raw.portrait).width(600).height(800).url(),
    heading: raw.heading || "Crafting stories through light",
    bio: bioBlocks,
    stats: raw.stats || [],
  };
}

export async function getContact() {
  if (!isSanityConfigured || !client) {
    return {
      email: "hello@neemasadeghi.com",
      phone: "+1 (310) 555-1234",
      location: "Los Angeles, CA",
      instagram: "https://instagram.com",
      vimeo: "https://vimeo.com",
      imdb: "https://imdb.com",
    };
  }

  let raw;
  try {
    raw = await client.fetch(
      `*[_type == "contact"][0] {
        email,
        phone,
        location,
        instagram,
        vimeo,
        imdb
      }`
    );
  } catch {
    raw = null;
  }

  return {
    email: raw?.email || "hello@neemasadeghi.com",
    phone: raw?.phone || "",
    location: raw?.location || "Los Angeles, CA",
    instagram: raw?.instagram || "",
    vimeo: raw?.vimeo || "",
    imdb: raw?.imdb || "",
  };
}
