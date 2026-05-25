import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { muxInput } from "sanity-plugin-mux-input";
import { SWEETIEPIE_SANITY_PROJECT_ID } from "@/lib/sanity-public-project";
import { schemaTypes } from "@/sanity/schemas";

const onVercel = Boolean(process.env.VERCEL);

/** Neema.film — only used for local dual-workspace dev in this repo. */
const neemaProjectId =
  process.env.NEXT_PUBLIC_SANITY_NEEMA_PROJECT_ID || "tn1vmlrk";
const neemaDataset =
  process.env.NEXT_PUBLIC_SANITY_NEEMA_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

/**
 * On Vercel, always pin Sweetiepie's project id. If `NEXT_PUBLIC_SANITY_PROJECT_ID` is
 * mistakenly set to Neema's (`tn1vmlrk`), Sanity's "Register this studio" flow opens
 * Manage on the wrong project no matter what you click in the UI.
 */
const sweetiepieProjectId = onVercel
  ? SWEETIEPIE_SANITY_PROJECT_ID
  : process.env.NEXT_PUBLIC_SANITY_SWEETIEPIE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    SWEETIEPIE_SANITY_PROJECT_ID;
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

const neemaWorkspace = {
  name: "neema-film",
  title: "Neema.film",
  projectId: neemaProjectId,
  dataset: neemaDataset,
  basePath: "/studio/neema",
  plugins: [
    structureTool({
      structure: orderableContentStructure,
    }),
    muxInput(),
  ],
  schema: {
    types: schemaTypes,
  },
};

const sweetiepieWorkspace = {
  name: "sweetiepie",
  title: "Sweetiepie",
  projectId: sweetiepieProjectId,
  dataset: sweetiepieDataset,
  basePath: "/studio/sweetiepie",
  plugins: [
    structureTool({
      structure: orderableContentStructure,
    }),
    muxInput(),
  ],
  schema: {
    types: schemaTypes,
  },
};

/**
 * On Vercel (sweetiepie.film), ship only the Sweetiepie workspace. Two workspaces in one
 * bundle make Studio pick or fall back to the first (Neema), which points at tn1vmlrk
 * and shows the wrong "register" / project state for Sweetiepie editors.
 * Local `next dev`: both workspaces so you can open /studio/neema or /studio/sweetiepie.
 */
const includeNeemaWorkspace =
  !onVercel && process.env.NODE_ENV === "development";

export default defineConfig(
  includeNeemaWorkspace
    ? [neemaWorkspace, sweetiepieWorkspace]
    : [sweetiepieWorkspace]
);
