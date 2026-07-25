import assert from "node:assert/strict";
import test from "node:test";
import { starterCatalog } from "@project42/platform";

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the Project 42 home page", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Project 42/);
  assert.match(html, /Start curious/);
  assert.match(html, /Self-paced learning/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("renders academy and field-guide indexes", async () => {
  const [learn, resources] = await Promise.all([render("/learn"), render("/resources")]);
  assert.equal(learn.status, 200);
  assert.equal(resources.status, 200);
  assert.match(await learn.text(), /Learning paths with a clear next step/);
  assert.match(await resources.text(), /Answers for the work in front of you/);
});

test("renders stable learning and resource routes", async () => {
  const routes = [
    ...starterCatalog.paths.map((path) => `/learn/${path.id}`),
    ...starterCatalog.paths.flatMap((path) =>
      path.moduleIds.map((moduleId) => `/learn/${path.id}/${moduleId}`),
    ),
    ...starterCatalog.resources.map((resource) => `/resources/${resource.id}`),
  ];

  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} should render`);
  }
});

test("renders evidence-producing activities for every substantive module", async () => {
  const activityModules = starterCatalog.modules.filter(
    (learningModule) => learningModule.activity,
  );
  assert.equal(activityModules.length, 8);

  for (const learningModule of activityModules) {
    const path = starterCatalog.paths.find((candidate) =>
      candidate.moduleIds.includes(learningModule.id),
    );
    assert.ok(path);
    const response = await render(`/learn/${path.id}/${learningModule.id}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Practice activity/);
    assert.ok(html.includes(learningModule.activity.title));
    assert.match(html, /What to produce/);
    assert.match(html, /Reflect before continuing/);
    assert.ok(
      html.includes(`aria-labelledby="${learningModule.activity.id}-title"`),
      `${learningModule.id} activity needs an accessible label relationship`,
    );
    assert.ok(
      html.includes(`id="${learningModule.activity.id}-title"`),
      `${learningModule.id} activity needs a matching heading id`,
    );
  }

  const legacyResponse = await render("/learn/ai-foundations/what-ai-does");
  assert.equal(legacyResponse.status, 200);
  assert.doesNotMatch(await legacyResponse.text(), /Practice activity/);
});

test("all rendered internal navigation links resolve", async () => {
  const entryRoutes = ["/", "/learn", "/resources", "/profile", "/about"];
  const internalLinks = new Set(entryRoutes);

  for (const route of entryRoutes) {
    const response = await render(route);
    const html = await response.text();
    for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const url = new URL(match[1], "https://project-42.dev");
      if (url.origin === "https://project-42.dev") internalLinks.add(url.pathname);
    }
  }

  for (const route of internalLinks) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} linked from the site should render`);
  }
});

test("publishes accessible document landmarks and discovery metadata", async () => {
  const [home, sitemap, robots] = await Promise.all([
    render("/"),
    render("/sitemap.xml"),
    render("/robots.txt"),
  ]);
  const html = await home.text();

  assert.equal(home.status, 200);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /id="main-content" tabindex="-1"/);
  assert.match(html, /<nav aria-label="Primary navigation">/);
  assert.equal(sitemap.status, 200);
  assert.equal(robots.status, 200);
});
