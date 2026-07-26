import type { MetadataRoute } from "next";
import { starterCatalog } from "@project42/platform";
import { diagramCatalog } from "./lib/diagrams";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://project-42.dev";
  return [
    "",
    "/learn",
    "/resources",
    "/diagrams",
    "/profile",
    "/learner-data",
    "/about",
    ...starterCatalog.paths.map((path) => `/learn/${path.id}`),
    ...starterCatalog.paths.flatMap((path) =>
      path.moduleIds.map((moduleId) => `/learn/${path.id}/${moduleId}`),
    ),
    ...starterCatalog.resources.map((resource) => `/resources/${resource.id}`),
    ...diagramCatalog.map((diagram) => `/diagrams/${diagram.id}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date("2026-07-25"),
    changeFrequency: path.startsWith("/resources") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.split("/").length <= 2 ? 0.8 : 0.6,
  }));
}
