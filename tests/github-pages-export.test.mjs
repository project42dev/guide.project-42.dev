import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { starterCatalog } from "@project42/platform";
import { buildRouteInventory } from "../scripts/link-integrity.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputRoot = path.join(projectRoot, "dist", "pages");

test("exports every governed Field Guide route for GitHub Pages", async () => {
  const inventory = buildRouteInventory(starterCatalog);
  const manifest = JSON.parse(
    await readFile(path.join(outputRoot, "pages-manifest.json"), "utf8"),
  );

  assert.equal(manifest.canonicalDomain, "guide.project-42.dev");
  assert.deepEqual(manifest.htmlRoutes, inventory.htmlRoutes);
  for (const route of inventory.htmlRoutes) {
    const relative = route === "/" ? "index.html" : `${route.slice(1)}/index.html`;
    await access(path.join(outputRoot, relative));
  }
});

test("preserves Field Guide deep links as unified-portal redirects", async () => {
  const [home, releaseFacts, application, installedPlatform] = await Promise.all([
    readFile(path.join(outputRoot, "index.html"), "utf8"),
    readFile(path.join(outputRoot, "release-facts.json"), "utf8").then(JSON.parse),
    readFile(path.join(projectRoot, "package.json"), "utf8").then(JSON.parse),
    readFile(
      path.join(projectRoot, "node_modules", "@project42", "platform", "package.json"),
      "utf8",
    ).then(JSON.parse),
  ]);

  assert.match(home, /https:\/\/project-42\.dev\/guide\//);
  const resource = await readFile(path.join(outputRoot, "resources", starterCatalog.resources[0].id, "index.html"), "utf8");
  assert.match(resource, new RegExp(`https://project-42.dev/guide/resources/${starterCatalog.resources[0].id}/`));
  assert.equal(releaseFacts.siteVersion, application.version);
  assert.equal(releaseFacts.platformVersion, installedPlatform.version);
  assert.equal(releaseFacts.counts.resources, 91);
  assert.equal(releaseFacts.counts.learningPaths, 0);
});

test("contains GitHub Pages controls without server or Sites metadata", async () => {
  assert.equal(
    await readFile(path.join(outputRoot, "CNAME"), "utf8"),
    "guide.project-42.dev\n",
  );
  await access(path.join(outputRoot, ".nojekyll"));
  await access(path.join(outputRoot, "404.html"));
  await assert.rejects(access(path.join(outputRoot, ".openai")));
  await assert.rejects(access(path.join(outputRoot, "server")));
});
