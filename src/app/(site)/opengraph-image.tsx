import { ImageResponse } from "next/og";
import { getProjects } from "@/lib/sanity-queries";
import { getHomeShareImage, getProjectShareImage } from "@/lib/share-image";
import { SITE_HEADLINE, SITE_TAGLINE } from "@/lib/site-brand";

export const alt = SITE_HEADLINE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const projects = await getProjects();
  const backgroundUrl =
    getHomeShareImage(projects) ||
    (projects?.[0] ? getProjectShareImage(projects[0]) : null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0a0a0a",
        }}
      >
        {backgroundUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.3)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 108,
              fontWeight: 400,
              color: "#ffd8ef",
              letterSpacing: "0.02em",
              textTransform: "lowercase",
              textShadow: "0 2px 32px rgba(0, 0, 0, 0.55)",
            }}
          >
            sweetiepie
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 22,
              color: "rgba(255, 216, 239, 0.82)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
