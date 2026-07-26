import type { MetadataRoute } from "next";
import { starterCatalog } from "@project42/platform";
import { diagramCatalog } from "./lib/diagrams";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://guide.project-42.dev";
  return [
    "",
    "/resources",
    "/diagrams",
    ...starterCatalog.resources.map((resource) => `/resources/${resource.id}`),
    ...diagramCatalog.map((diagram) => `/diagrams/${diagram.id}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date("2026-07-25"),
    changeFrequency: path === "" || path.startsWith("/resources") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.split("/").length <= 2 ? 0.8 : 0.6,
  }));
}
