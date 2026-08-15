import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("discovers and reads accessible source-first visual guides", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Visual guides", exact: true }).first().click();
  await expect(page).toHaveURL(/\/diagrams\/?$/);
  await expect(
    page.getByRole("heading", { name: "See the system, not just the steps." }),
  ).toBeVisible();
  await expect(page.locator(".diagram-card")).toHaveCount(11);

  await page
    .getByRole("link", { name: "Explore this visual" })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "The learning evidence loop" }),
  ).toBeVisible();
  const diagram = page.locator(".diagram-canvas img");
  await expect(diagram).toBeVisible();
  await expect(diagram).toHaveAttribute("alt", /flow starts at Learn/i);
  await expect(page.getByRole("figure").first()).toContainText(
    "Project 42 turns study into evidence",
  );
  await expect(page.getByRole("heading", { name: "Key takeaways" })).toBeVisible();

  const viewerTrigger = page.getByRole("button", {
    name: /open full-screen viewer/i,
  });
  await viewerTrigger.click();
  const viewer = page.getByRole("dialog", { name: /The learning evidence loop/ });
  await expect(viewer).toBeVisible();
  // Close button should be focused when dialog opens
  await expect(viewer.getByRole("button", { name: /close fullscreen viewer/i })).toBeFocused();
  // Zoom controls are present
  await expect(viewer.getByRole("button", { name: "Zoom in" })).toBeVisible();
  await expect(viewer.getByRole("button", { name: "Zoom out" })).toBeVisible();
  for (let index = 0; index < 12; index += 1) {
    await viewer.getByRole("button", { name: "Zoom in" }).click();
  }
  // SVG container should be scrollable at 400% zoom
  await expect(viewer.locator(".diagram-svg-container")).toBeVisible();
  const canScroll = await viewer.locator(".diagram-svg-container").evaluate(
    (element) =>
      element.scrollWidth > element.clientWidth ||
      element.scrollHeight > element.clientHeight,
  );
  expect(canScroll).toBe(true);

  const dialogAccessibility = await new AxeBuilder({ page })
    .include(".diagram-fullscreen-overlay")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(dialogAccessibility.violations).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
  await expect(viewerTrigger).toBeFocused();

  const [svg, source] = await Promise.all([
    request.get("/diagrams/learning-evidence-loop.svg"),
    request.get("/diagrams/learning-evidence-loop.mmd"),
  ]);
  expect(svg.status()).toBe(200);
  expect(svg.headers()["content-type"]).toContain("image/svg+xml");
  expect((await svg.text())).toContain("project42:source-sha256=");
  expect(source.status()).toBe(200);
  expect(await source.text()).toContain("accTitle: The learning evidence loop");

  // Scan from the top of the page, not from wherever the viewer interaction
  // left it. Closing the dialog returns focus to its trigger, and the browser
  // scrolls that into view, so the page-wide scan was running at an incidental
  // offset. axe's target-size rule then reports whatever the sticky header
  // happens to be covering at that offset as "partially obscured", which makes
  // the result depend on font metrics rather than on the markup: this passed on
  // Windows and failed on the Linux runner with the header unchanged in height.
  // Every other page-wide scan in this suite runs at scroll 0; this one now
  // matches. The dialog itself is still scanned above, scoped to .diagram-viewer.
  await page.evaluate(() => window.scrollTo(0, 0));
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("renders the Orchard lifecycle as a real React component, not a Mermaid SVG", async ({
  page,
}) => {
  await page.goto("/diagrams/orchard-lifecycle");
  await expect(
    page.getByRole("heading", { name: "The Orchard content lifecycle" }),
  ).toBeVisible();

  // The diagram is DOM the component owns: a figure with real <button>
  // nodes, never an <img> or an injected Mermaid SVG.
  const diagram = page.locator(".orchard-lifecycle-diagram");
  await expect(diagram).toBeVisible();
  await expect(page.locator(".orchard-lifecycle-diagram img")).toHaveCount(0);
  await expect(page.locator(".orchard-lifecycle-diagram svg")).toHaveCount(1);
  await expect(page.locator(".orchard-node")).toHaveCount(19);

  // Clicking a step in the labeled step list jumps straight to it.
  await page
    .locator(".orchard-step-list-item")
    .filter({ hasText: "Gate 1: the owner approves on the comment" })
    .click();
  await expect(page.locator(".orchard-step-badge")).toHaveText(
    "Step 7 of 19: Gate 1: the owner approves on the comment",
  );

  // Documentation links for the active step are rendered and point at the
  // public Orchard repository, never at the private ops repository.
  const links = page.locator(".orchard-step-links a");
  await expect(links.first()).toBeVisible();
  const hrefs = await links.evaluateAll((anchors) =>
    anchors.map((a) => a.getAttribute("href") ?? ""),
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    expect(href).toContain("github.com/project42dev/orchard");
    expect(href).not.toContain("project42dev-ops");
  }

  // Clicking a node in the diagram itself jumps to its step.
  const kickoffNode = page.getByRole("button", { name: "Step 1: Discovery kicks off" });
  await expect(kickoffNode).toBeVisible();
  await kickoffNode.click();
  await expect(page.locator(".orchard-step-badge")).toHaveText(
    "Step 1 of 19: Discovery kicks off",
  );

  // The same node is keyboard-operable (a real <button>), with a visible
  // focus state and the correct aria-current once selected.
  await kickoffNode.focus();
  await expect(kickoffNode).toBeFocused();
  const gate1Node = page.getByRole("button", { name: /^Step 7: Gate 1/ });
  await gate1Node.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".orchard-step-badge")).toHaveText(
    "Step 7 of 19: Gate 1: the owner approves on the comment",
  );
  await expect(gate1Node).toHaveAttribute("aria-current", "step");

  // Steps 7, 17, and 19 all share the Gate 1 node; the step list still
  // reaches every one of them directly even though the node itself only
  // jumps to the canonical step.
  await page
    .locator(".orchard-step-list-item")
    .filter({ hasText: "The request joins the same queue and Gate 1" })
    .click();
  await expect(page.locator(".orchard-step-badge")).toHaveText(
    "Step 19 of 19: The request joins the same queue and Gate 1",
  );
  await expect(gate1Node).toHaveAttribute("aria-current", "step");

  // Designed-but-not-built work is marked dashed and with an explicit text
  // badge, never by colour alone.
  await expect(page.getByText("Designed, not built").first()).toBeVisible();
});

test("Orchard lifecycle fullscreen opens, escapes, and returns focus", async ({ page }) => {
  await page.goto("/diagrams/orchard-lifecycle");

  const trigger = page.getByRole("button", { name: "Open full-screen viewer" });
  await trigger.click();

  const expanded = page.locator(".orchard-lifecycle-diagram.orchard-expanded");
  await expect(expanded).toBeVisible();
  const exitButton = page.getByRole("button", { name: "Exit fullscreen viewer" });
  await expect(exitButton).toBeVisible();
  await expect(exitButton).toBeFocused();

  // The diagram stays fully interactive while expanded.
  await expect(expanded.getByRole("button", { name: "Step 1: Discovery kicks off" })).toBeVisible();

  const isNativeFullscreen = await page.evaluate(() => Boolean(document.fullscreenElement));

  const accessibility = await new AxeBuilder({ page })
    .include(".orchard-lifecycle-diagram")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(page.locator(".orchard-lifecycle-diagram.orchard-expanded")).toHaveCount(0);
  if (isNativeFullscreen) {
    await expect
      .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
      .toBe(false);
  }
  await expect(trigger).toBeFocused();
});

test("Orchard lifecycle is legible with the OS in dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/diagrams/orchard-lifecycle");
  await expect(page.locator(".orchard-lifecycle-diagram")).toBeVisible();

  const accessibility = await new AxeBuilder({ page })
    .include(".orchard-lifecycle-diagram")
    .withTags(["wcag2aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("keeps diagram pages readable at a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/diagrams/safe-agent-loop");
  await expect(page.getByRole("heading", { name: "The bounded agent loop" })).toBeVisible();
  await expect(page.locator(".diagram-canvas")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
