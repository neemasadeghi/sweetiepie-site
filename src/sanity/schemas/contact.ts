import { defineType, defineField } from "sanity";

export const contact = defineType({
  name: "contact",
  title: "Contact",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "instagram",
      title: "Instagram URL",
      type: "url",
    }),
    defineField({
      name: "vimeo",
      title: "Vimeo URL",
      type: "url",
    }),
    defineField({
      name: "imdb",
      title: "IMDb URL",
      type: "url",
    }),
  ],
  preview: {
    select: { title: "email" },
  },
});
