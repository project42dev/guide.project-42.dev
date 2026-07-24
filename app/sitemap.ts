import type { MetadataRoute } from "next";
import { starterCatalog } from "@project42/platform";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://project-42.dev";
  return [
    "",
    "/learn",
    "/resources",
    "/profile",
    "/about",
    ...starterCatalog.paths.map((path) => `/learn/${path.id}`),
    ...starterCatalog.paths.flatMap((path) =>
      path.moduleIds.map((moduleId) => `/learn/${path.id}/${moduleId}`),
    ),
    ...starterCatalog.resources.map((resource) => `/resources/${resource.id}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date("2026-07-23"),
    changeFrequency: path.startsWith("/resources") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.split("/").length <= 2 ? 0.8 : 0.6,
  }));
}
