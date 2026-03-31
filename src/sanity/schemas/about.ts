import { defineType, defineField } from "sanity";

export const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "portrait",
      title: "Portrait Photo",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "number", title: "Number", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "heading", media: "portrait" },
  },
});
