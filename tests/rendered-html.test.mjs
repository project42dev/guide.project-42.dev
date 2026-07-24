import assert from "node:assert/strict";
import test from "node:test";

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
  const [module, resource] = await Promise.all([
    render("/learn/ai-foundations/what-ai-does"),
    render("/resources/prompt-checklist"),
  ]);
  assert.equal(module.status, 200);
  assert.equal(resource.status, 200);
  assert.match(await module.text(), /What AI Does/);
  assert.match(await resource.text(), /Prompt Checklist/);
});
