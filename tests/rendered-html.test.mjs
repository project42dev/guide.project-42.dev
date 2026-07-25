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
    const html = await response.text();
    assert.match(html, /<main\b/, `${route} needs a main landmark`);
    assert.match(html, /<h1\b/, `${route} needs a primary heading`);
  }
});

test("renders evidence-producing activities for every substantive module", async () => {
  const activityModules = starterCatalog.modules.filter(
    (learningModule) => learningModule.activity,
  );
  assert.equal(activityModules.length, 13);

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

test("renders the complete AI Foundations curriculum and source provenance", async () => {
  const path = starterCatalog.paths.find(
    (candidate) => candidate.id === "ai-foundations",
  );
  assert.ok(path);
  assert.equal(path.moduleIds.length, 16);
  assert.equal(starterCatalog.modules.length, 22);

  for (const moduleId of path.moduleIds) {
    const learningModule = starterCatalog.modules.find(
      (candidate) => candidate.id === moduleId,
    );
    assert.ok(learningModule);
    const response = await render(`/learn/${path.id}/${moduleId}`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.ok(html.includes(learningModule.title));
    assert.match(html, /Sources and verification/);
    assert.match(html, /Knowledge check/);
    for (const section of learningModule.sections) {
      assert.ok(html.includes(section.title), `${moduleId} is missing ${section.id}`);
    }
    for (const source of learningModule.sources) {
      assert.ok(html.includes(source.title));
      assert.ok(html.includes(source.publisher));
      assert.ok(html.includes(source.lastVerified));
    }
  }
});

test("renders an accessible scored capstone evidence form", async () => {
  const learningModule = starterCatalog.modules.find(
    (candidate) => candidate.id === "ai-foundations-capstone",
  );
  assert.ok(learningModule?.capstone);
  const response = await render(
    "/learn/ai-foundations/ai-foundations-capstone",
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Applied capstone/);
  assert.match(html, /Required artifacts/);
  assert.match(html, /Evidence rubric/);
  assert.match(html, /Reflection and handoff/);
  assert.match(html, /Score and save capstone evidence/);
  assert.equal(learningModule.capstone.requiredArtifacts.length, 5);
  assert.equal(learningModule.capstone.rubric.criteria.length, 5);

  for (const [index, artifact] of learningModule.capstone.requiredArtifacts.entries()) {
    assert.ok(html.includes(artifact));
    assert.ok(
      html.includes(
        `for="${learningModule.capstone.id}-artifact-${index}"`,
      ),
    );
    assert.ok(
      html.includes(
        `id="${learningModule.capstone.id}-artifact-${index}"`,
      ),
    );
  }
  for (const criterion of learningModule.capstone.rubric.criteria) {
    assert.ok(html.includes(criterion.title));
    assert.ok(html.includes(criterion.description));
    for (const evidence of criterion.evidenceRequired) {
      assert.ok(html.includes(evidence));
    }
  }
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

test("keeps labelled relationships valid on learner-journey pages", async () => {
  const routes = [
    "/learn",
    "/learn/ai-foundations",
    "/learn/ai-foundations/research-with-evidence",
    "/learn/ai-foundations/ai-foundations-capstone",
    "/profile",
  ];

  for (const route of routes) {
    const response = await render(route);
    const html = await response.text();
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    const idSet = new Set(ids);
    assert.equal(ids.length, idSet.size, `${route} contains duplicate element IDs`);
    for (const match of html.matchAll(/\saria-labelledby="([^"]+)"/g)) {
      for (const id of match[1].split(/\s+/)) {
        assert.ok(idSet.has(id), `${route} references missing label ID ${id}`);
      }
    }
    for (const match of html.matchAll(/\saria-describedby="([^"]+)"/g)) {
      for (const id of match[1].split(/\s+/)) {
        assert.ok(
          idSet.has(id),
          `${route} references missing description ID ${id}`,
        );
      }
    }
  }
});
