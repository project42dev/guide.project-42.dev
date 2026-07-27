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

test("publishes current release facts and Field Guide content", async () => {
  const [home, releaseFacts] = await Promise.all([
    readFile(path.join(outputRoot, "index.html"), "utf8"),
    readFile(path.join(outputRoot, "release-facts.json"), "utf8").then(JSON.parse),
  ]);

  const normalizedHome = home.replaceAll("<!-- -->", "");
  assert.match(normalizedHome, /Project 42 Field Guide/);
  assert.match(normalizedHome, /Answers for the work in front of you/);
  assert.ok(normalizedHome.includes(`Site v${releaseFacts.siteVersion}`));
  assert.equal(releaseFacts.siteVersion, "0.4.0");
  assert.equal(releaseFacts.platformVersion, "0.42.0");
  assert.equal(releaseFacts.counts.resources, 70);
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
