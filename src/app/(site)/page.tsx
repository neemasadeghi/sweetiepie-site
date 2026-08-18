import { getProjects } from "@/lib/sanity-queries";
import { metadataForWorkPath } from "@/lib/link-preview-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const projects = await getProjects();
  return metadataForWorkPath("/", "sweetiepie", projects);
}

export default function HomePage() {
  return null;
}
