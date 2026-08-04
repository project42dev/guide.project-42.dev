import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("keeps content limits, provenance, and reuse guidance visible", async ({
  page,
}) => {
  await page.goto("/");
  const notice = page.getByRole("note");
  await expect(
    notice.getByRole("heading", { name: "Helpful evidence, not a guarantee" }),
  ).toBeVisible();
  await expect(notice).toContainText(/can become stale or contain errors/i);
  await expect(notice).toContainText(/CC BY 4.0/);
  await expect(
    notice.getByRole("link", {
      name: "Legal, licensing, and AI transparency",
    }),
  ).toHaveAttribute(
    "href",
    "https://project-42.dev/legal-transparency",
  );

  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("keeps content-use notices readable on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/diagrams/safe-agent-loop");
  await expect(page.getByRole("note")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
