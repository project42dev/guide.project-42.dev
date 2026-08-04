import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  getResourceFreshness,
  starterCatalog,
  type Level,
  type Provider,
  type Resource,
  type ResourceFormat,
  type ResourceFreshnessStatus,
} from "@project42/platform";

function expectedResources(filters: {
  topic?: string;
  provider?: Provider;
  level?: Level;
  format?: ResourceFormat;
  freshness?: ResourceFreshnessStatus;
  asOf: string;
}) {
  return starterCatalog.resources.filter((resource) => {
    const resourceFreshness = getResourceFreshness(resource, filters.asOf);
    return (
      (!filters.topic || resource.category === filters.topic) &&
      (!filters.provider || resource.providers.includes(filters.provider)) &&
      (!filters.level || resource.level === filters.level) &&
      (!filters.format || resource.format === filters.format) &&
      (!filters.freshness || resourceFreshness.status === filters.freshness)
    );
  });
}

async function expectNoAccessibilityViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

test("combines resource filters, resets cleanly, and exposes provenance", async ({
  context,
  page,
}) => {
  test.setTimeout(120_000);
  expect(starterCatalog.resources).toHaveLength(83);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto("/");
  const cards = page.locator(".resource-card");
  await expect(cards).toHaveCount(83);
  await expect(page.getByRole("status")).toHaveText(
    "Showing 83 of 83 resources",
  );
  await expectNoAccessibilityViolations(page);

  const searchInput = page.getByRole("searchbox", {
    name: "Search the field guide",
  });
  await searchInput.fill("MCP primitives and lifecycle");
  await expect(cards).toHaveCount(1);
  await expect(
    page.locator('[data-resource-id="mcp-primitives-reference"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(cards).toHaveCount(83);

  const topic = "Evaluation and safety";
  const provider: Provider = "provider-neutral";
  const format: ResourceFormat = "playbook";
  const level: Level = "advanced";
  const freshness: ResourceFreshnessStatus = "current";
  const asOf = new Date().toISOString().slice(0, 10);
  const expected = expectedResources({
    topic,
    provider,
    format,
    level,
    freshness,
    asOf,
  });
  expect(expected.length).toBeGreaterThan(0);

  await page.getByRole("combobox", { name: "Topic", exact: true }).selectOption({
    label: topic,
  });
  await page
    .getByRole("combobox", { name: "Provider", exact: true })
    .selectOption(provider);
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption(format);
  await page
    .getByRole("combobox", { name: "Level", exact: true })
    .selectOption(level);
  await page
    .getByRole("combobox", { name: "Freshness", exact: true })
    .selectOption(freshness);
  await expect(cards).toHaveCount(expected.length);
  await expect(page.getByRole("status")).toHaveText(
    `Showing ${expected.length} of 83 resources`,
  );
  for (const resource of expected) {
    await expect(
      page.locator(`[data-resource-id="${resource.id}"]`),
    ).toBeVisible();
  }

  await searchInput.fill("no-such-resource-42");
  await expect(cards).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "No resources match these filters.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Clear all filters" }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(cards).toHaveCount(83);
  await expect(
    page.getByRole("combobox", { name: "Topic", exact: true }),
  ).toHaveValue("all");
  await expect(
    page.getByRole("combobox", { name: "Provider", exact: true }),
  ).toHaveValue("all");
  await expect(
    page.getByRole("combobox", { name: "Format", exact: true }),
  ).toHaveValue("all");
  await expect(
    page.getByRole("combobox", { name: "Level", exact: true }),
  ).toHaveValue("all");
  await expect(
    page.getByRole("combobox", { name: "Freshness", exact: true }),
  ).toHaveValue("all");

  const representative = starterCatalog.resources.find(
    (resource): resource is Resource =>
      resource.id === "human-controlled-ai-release-gate",
  );
  if (!representative) throw new Error("Representative resource is missing");
  const representativeCard = page.locator(
    `[data-resource-id="${representative.id}"]`,
  );
  await expect(representativeCard.getByText("Audience")).toBeVisible();
  await expect(representativeCard.getByText("Prerequisites")).toBeVisible();
  await expect(representativeCard.getByText("Owner")).toBeVisible();
  await representativeCard
    .getByRole("link", { name: `Open ${representative.title}` })
    .click();

  await expect(
    page.getByRole("heading", { level: 1, name: representative.title }),
  ).toBeVisible();
  await expect(page.getByRole("definition").filter({ hasText: "Every 60 days" }))
    .toBeVisible();
  await expect(page.getByText("Next review due")).toBeVisible();
  for (const source of representative.sources) {
    const link = page.locator(`a[href="${source.url}"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toContainText(source.title);
    await expect(link).toHaveAttribute("href", source.url);
  }
  const copyButton = page.locator(".copy-code-control button").first();
  await expect(copyButton).toHaveAccessibleName("Copy");
  await copyButton.click();
  await expect(copyButton).toHaveText("Copied");
  await expectNoAccessibilityViolations(page);
});
