import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "landingMux",
      title: "Landing video (Mux)",
      type: "mux.video",
      description:
        "Full-screen loop on sweetiepie.film — upload here via Mux (no audio, 5–15 sec). Landscape / 16:9 recommended.",
    }),
    defineField({
      name: "landingMuxPortrait",
      title: "Landing video — portrait (optional)",
      type: "mux.video",
      description:
        "Optional 9:16 clip for phones. If empty, the landscape clip is used on all devices.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Landing page" }),
  },
});
