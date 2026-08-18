import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/lib/sanity-queries";
import {
  getProjectShareImage,
  getProjectShareTitle,
} from "@/lib/share-image";

export const alt = "Project preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffd8ef",
            fontSize: 48,
            fontFamily: "Georgia, serif",
          }}
        >
          sweetiepie
        </div>
      ),
      { ...size }
    );
  }

  const imageUrl = getProjectShareImage(project);
  const title = getProjectShareTitle(project);
  const subtitle = project.director ? `dir. ${project.director}` : "sweetiepie";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#000",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          width={1200}
          height={630}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            position: "absolute",
            inset: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.08) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "52px 56px",
          }}
        >
          <div
            style={{
              fontSize: 20,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#ffd8ef",
              marginBottom: 14,
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            sweetiepie
          </div>
          <div
            style={{
              fontSize: 58,
              color: "#fff",
              lineHeight: 1.05,
              fontFamily: "Georgia, serif",
              maxWidth: "920px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.78)",
              marginTop: 14,
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
