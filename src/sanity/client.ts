import { createClient } from "next-sanity";
import { apiVersion } from "./config";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const client = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn: false })
  : null;
