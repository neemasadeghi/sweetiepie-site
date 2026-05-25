import { createClient } from "next-sanity";
import { resolvePublicSanityProjectId } from "@/lib/sanity-public-project";
import { apiVersion } from "./config";

const projectId = resolvePublicSanityProjectId();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const client = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn: false })
  : null;
