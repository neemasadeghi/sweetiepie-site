import type { Project } from "@/components/ProjectCard";

export function filterProjectsByCategory(
  projects: Project[],
  category: string | null
): Project[] {
  if (!category) return projects;
  return projects.filter((p) => p.category.includes(category));
}
