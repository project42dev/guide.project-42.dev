import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Project 42 — Learn AI with confidence",
    short_name: "Project 42",
    description:
      "Free, open, provider-neutral AI learning paths and practical field guides.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3eb",
    theme_color: "#0b1225",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
