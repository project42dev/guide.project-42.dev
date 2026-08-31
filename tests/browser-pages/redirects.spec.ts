import { expect, test } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

const unifiedOrigin = "https://project-42.dev";

async function expectUnifiedRedirect(
  request: APIRequestContext,
  legacyPath: string,
  unifiedPath: string,
) {
  const response = await request.get(legacyPath, { maxRedirects: 0 });
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  const destination = `${unifiedOrigin}${unifiedPath}`;
  expect(html).toContain(`<meta http-equiv="refresh" content="0; url=${destination}">`);
  expect(html).toContain(`<link rel="canonical" href="${destination}">`);
  expect(html).toContain('<meta name="robots" content="noindex">');
  expect(html).toContain(`<a href="${destination}">`);
}

test("legacy Field Guide home redirects to the unified Guide", async ({ request }) => {
  await expectUnifiedRedirect(request, "/", "/guide/");
});

test("legacy resource deep links preserve their identifier", async ({ request }) => {
  await expectUnifiedRedirect(
    request,
    "/resources/human-controlled-ai-release-gate/",
    "/guide/resources/human-controlled-ai-release-gate/",
  );
});

test("legacy diagram deep links preserve their identifier", async ({ request }) => {
  await expectUnifiedRedirect(
    request,
    "/diagrams/safe-agent-loop/",
    "/guide/diagrams/safe-agent-loop/",
  );
});
