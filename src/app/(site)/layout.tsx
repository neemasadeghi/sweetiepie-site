import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WorkArea } from "@/components/WorkArea";
import { getProjects } from "@/lib/sanity-queries";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await getProjects();

  return (
    <>
      <Navbar />
      <main className="site-main">
        <WorkArea projects={projects}>{children}</WorkArea>
      </main>
      <Footer />
    </>
  );
}
