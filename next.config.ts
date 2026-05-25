import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "sweetiepie.film" }],
        destination: "https://www.sweetiepie.film/:path*",
        permanent: true,
      },
      { source: "/about", destination: "/", permanent: false },
      { source: "/studio", destination: "/studio/sweetiepie", permanent: false },
      { source: "/narrative", destination: "/documentary", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2560, 3840],
  },
};

export default nextConfig;
