import { WorkGrid } from "@/components/WorkGrid";
import { BottomSection } from "@/components/BottomSection";
import { getProjects, getAbout, getContact } from "@/lib/sanity-queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projects, about, contact] = await Promise.all([
    getProjects(),
    getAbout(),
    getContact(),
  ]);

  if (!projects) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "var(--font-body)",
      }}>
        <h1 style={{
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 700,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}>
          Under Construction
        </h1>
        <p style={{
          fontSize: "1rem",
          fontWeight: 300,
          color: "var(--text-secondary)",
          maxWidth: "400px",
          lineHeight: 1.6,
        }}>
          This site is being updated and will be back in a few hours. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <>
      <WorkGrid projects={projects} />
      <BottomSection about={about} contact={contact} />
    </>
  );
}
