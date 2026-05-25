import { defineType, defineField } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "project" }),
    defineField({
      name: "client",
      title: "Artist / Client",
      type: "string",
      description: "Artist name for music videos, or brand/client name for commercials",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Song / Campaign Title",
      type: "string",
      description: "Song title for music videos, or product/campaign name for commercials",
    }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      options: {
        list: [
          { title: "Short Film", value: "Short Film" },
          { title: "Feature Film", value: "Feature Film" },
          { title: "Documentary", value: "Documentary" },
        ],
      },
      description: "Type of narrative project",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "client", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Categories",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Selected", value: "selected" },
          { title: "Music Video", value: "music-video" },
          { title: "Commercial", value: "commercial" },
          { title: "Documentary", value: "narrative" },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "still",
      title: "Still Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "previewMux",
      title: "Preview video (Mux)",
      type: "mux.video",
      description:
        "Recommended: short looping clip via Mux. Configure the Mux token in Studio (Videos / plugin setup) the first time you upload.",
    }),
    defineField({
      name: "previewVideo",
      title: "Preview video (legacy file)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      description:
        "Optional fallback: MP4/WebM hosted on Sanity. Prefer “Preview video (Mux)” for new work.",
    }),
    defineField({
      name: "vimeoTitle",
      title: "Primary Video Title",
      type: "string",
      description: "Title displayed above the main video (e.g. \"A+ Smoothness\")",
    }),
    defineField({
      name: "vimeoUrl",
      title: "Vimeo URL (Primary)",
      type: "url",
      description: "Main Vimeo link — used as the hero video on the project page",
    }),
    defineField({
      name: "additionalVideos",
      title: "Additional Videos",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "url",
              title: "Vimeo URL",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "url" },
          },
        },
      ],
      description: "Add more Vimeo links to show below the main video",
    }),
    defineField({
      name: "gallery",
      title: "Gallery Stills",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
            defineField({
              name: "link",
              title: "Link URL",
              type: "url",
              description: "Optional — link to an article, review, etc.",
            }),
          ],
          preview: {
            select: { title: "caption", media: "image" },
          },
        },
      ],
      description: "Add stills to the project page. Each can have an optional caption and link.",
    }),
    defineField({
      name: "director",
      title: "Director",
      type: "string",
      description: "Defaults to sweetiepie if left empty",
    }),
    defineField({
      name: "cinematographer",
      title: "Cinematographer",
      type: "string",
      description: "Defaults to Neema Sadeghi if left empty",
    }),
    defineField({
      name: "production",
      title: "Production Company",
      type: "string",
    }),
    defineField({
      name: "imdbUrl",
      title: "IMDb URL",
      type: "url",
      description: "Link to the IMDb page for this project",
    }),
    defineField({
      name: "watchPlatform",
      title: "Watch Platform",
      type: "string",
      description: "Streaming platform name (e.g. \"Mubi\", \"Netflix\", \"Apple TV+\")",
    }),
    defineField({
      name: "watchUrl",
      title: "Watch URL",
      type: "url",
      description: "Link to watch the film on the streaming platform",
    }),
  ],
  preview: {
    select: { title: "client", subtitle: "subtitle", media: "still" },
  },
});
