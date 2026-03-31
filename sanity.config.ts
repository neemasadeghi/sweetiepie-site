import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { schemaTypes } from "@/sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "portfolio",
  title: "Portfolio CMS",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title("Content")
          .items([
            orderableDocumentListDeskItem({
              type: "project",
              title: "Projects",
              S,
              context,
            }),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== "project"
            ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
