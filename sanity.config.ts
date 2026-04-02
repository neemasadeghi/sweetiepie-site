import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { schemaTypes } from "@/sanity/schemas";

/** Neema.film — do not use NEXT_PUBLIC_SANITY_PROJECT_ID (this app uses Sweetiepie’s id there). */
const neemaProjectId =
  process.env.NEXT_PUBLIC_SANITY_NEEMA_PROJECT_ID || "tn1vmlrk";
const neemaDataset =
  process.env.NEXT_PUBLIC_SANITY_NEEMA_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

const sweetiepieProjectId =
  process.env.NEXT_PUBLIC_SANITY_SWEETIEPIE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  "a7vpcuze";
const sweetiepieDataset =
  process.env.NEXT_PUBLIC_SANITY_SWEETIEPIE_DATASET || "production";

const orderableContentStructure: StructureResolver = (S, context) =>
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
    ]);

export default defineConfig([
  {
    name: "neema-film",
    title: "Neema.film",
    projectId: neemaProjectId,
    dataset: neemaDataset,
    basePath: "/studio/neema",
    plugins: [
      structureTool({
        structure: orderableContentStructure,
      }),
    ],
    schema: {
      types: schemaTypes,
    },
  },
  {
    name: "sweetiepie",
    title: "Sweetiepie",
    projectId: sweetiepieProjectId,
    dataset: sweetiepieDataset,
    basePath: "/studio/sweetiepie",
    plugins: [
      structureTool({
        structure: orderableContentStructure,
      }),
    ],
    schema: {
      types: schemaTypes,
    },
  },
]);
