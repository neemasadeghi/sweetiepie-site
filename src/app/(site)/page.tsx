import { getProjects, getLandingVideo } from "@/lib/sanity-queries";
import { HomeLanding } from "@/components/HomeLanding";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "sweetiepie",
  description: "sweetiepie — Director",
};

export default async function HomePage() {
  const [projects, landing] = await Promise.all([
    getProjects(),
    getLandingVideo(),
  ]);

  return <HomeLanding projects={projects ?? []} landing={landing} />;
}
