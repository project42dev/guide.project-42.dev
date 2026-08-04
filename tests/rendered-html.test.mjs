import assert from "node:assert/strict";
import test from "node:test";
import { starterCatalog } from "@project42/platform";
import diagramConfig from "../config/diagrams.json" with { type: "json" };
import releaseFacts from "../public/release-facts.json" with { type: "json" };

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://guide.project-42.dev${pathname}`, {
      headers: { accept: "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the Field Guide home and complete searchable catalog", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = (await response.text()).replaceAll("<!-- -->", "");

  assert.match(html, /Project 42 Field Guide/);
  assert.match(html, /Answers for the work in front of you/);
  assert.equal(starterCatalog.resources.length, 83);
  assert.equal((html.match(/data-resource-id=/g) ?? []).length, 83);
  assert.match(html, /Showing 83 of 83 resources/);
  assert.ok(html.includes(`Site v${releaseFacts.siteVersion}`));
  assert.ok(html.includes(`Platform v${releaseFacts.platformVersion}`));
  assert.ok(html.includes(`Content v${releaseFacts.contentVersion}`));
  assert.match(html, /https:\/\/learn\.project-42\.dev/);
});

test("renders every governed resource with metadata and provenance", async () => {
  for (const resource of starterCatalog.resources) {
    const response = await render(`/resources/${resource.id}`);
    assert.equal(response.status, 200, resource.id);
    const html = await response.text();

    assert.ok(html.includes(resource.title), resource.id);
    assert.ok(html.includes(resource.summary), resource.id);
    assert.ok(html.includes(resource.lastVerified), resource.id);
    assert.match(html, /Helpful evidence, not a guarantee/, resource.id);
    assert.match(
      html,
      /https:\/\/project-42\.dev\/legal-transparency/,
      resource.id,
    );
    for (const source of resource.sources) {
      assert.ok(html.includes(source.url), `${resource.id}: ${source.url}`);
    }
  }
});

// The guide is this site's root, so there is exactly one guide index. /resources
// was a second copy of it, reached by clicking "Field Guide" while already on
// the Field Guide, and the copy people landed on first was the one without the
// content-use notice. The old path still resolves, because it is in sitemaps
// and bookmarks, but it resolves to the one page rather than to a twin.
test("sends the old resource index to the root instead of a second copy", async () => {
  const moved = await render("/resources");
  assert.equal(moved.status, 308);
  assert.equal(new URL(moved.headers.get("location")).pathname, "/");

  const home = await render("/");
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /Answers for the work in front of you/);
  assert.match(
    html,
    /Helpful evidence, not a guarantee/,
    "the content-use notice belongs on the page people actually land on",
  );
});

test("keeps every resource detail page reachable under /resources", async () => {
  // The redirect is an exact match on the index. A prefix match would take out
  // all 83 detail pages, and they are the reason the path exists.
  const [first] = starterCatalog.resources;
  const detail = await render(`/resources/${first.id}`);
  assert.equal(detail.status, 200);
  assert.match(await detail.text(), new RegExp(first.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("renders every visual guide", async () => {
  const diagrams = await render("/diagrams");
  assert.equal(diagrams.status, 200);
  for (const diagram of diagramConfig.diagrams) {
    const response = await render(`/diagrams/${diagram.id}`);
    assert.equal(response.status, 200, diagram.id);
    assert.ok((await response.text()).includes(diagram.title), diagram.id);
  }
});

test("links every global footer to canonical Legal & Transparency", async () => {
  for (const route of ["/", "/diagrams"]) {
    const response = await render(route);
    assert.equal(response.status, 200, route);
    assert.match(
      await response.text(),
      /https:\/\/project-42\.dev\/legal-transparency/,
      route,
    );
  }
});

test("does not expose Learn-owned routes", async () => {
  for (const route of ["/learn", "/profile", "/learner-data", "/about"]) {
    const response = await render(route);
    assert.equal(response.status, 404, route);
  }
});

test("renders canonical metadata and brand assets", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /https:\/\/guide\.project-42\.dev/);
  assert.match(html, /href="\/brand\/project-42-mark\.svg"/);
  assert.match(html, /href="\/favicon\.ico"/);
});
