import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/",
  "/resources/human-controlled-ai-release-gate",
  "/diagrams",
  "/diagrams/safe-agent-loop",
];
const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoHorizontalPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll<HTMLElement>("body *")]
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          element: element.tagName.toLowerCase(),
          className: String(element.className),
          left: Math.round(bounds.left),
          right: Math.round(bounds.right),
          text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 60),
        };
      })
      .filter(({ left, right }) => left < -1 || right > clientWidth + 1)
      .slice(0, 10);
    const scrollContainers = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => element.scrollWidth > element.clientWidth + 1)
      .map((element) => ({
        className: String(element.className),
        clientWidth: element.clientWidth,
        element: element.tagName.toLowerCase(),
        scrollWidth: element.scrollWidth,
      }))
      .slice(0, 10);
    return {
      clientWidth,
      offenders,
      scrollContainers,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  expect(
    overflow.scrollWidth - overflow.clientWidth,
    JSON.stringify(overflow),
  ).toBeLessThanOrEqual(1);
}

async function expectMinimumTargets(page: Page) {
  const undersized = await page
    .locator(
      [
        ".site-header a",
        ".header-menu-trigger",
        ".header-menu-list a",
        ".header-menu-footer button",
        ".button",
        ".resource-controls input",
        ".resource-controls select",
        ".clear-filter-button",
        ".resource-foot a",
        ".copy-code-control button",
        ".diagram-viewer-trigger",
        ".diagram-viewer-controls button",
        ".diagram-source-card a",
        ".diagram-next a",
        ".footer-grid a",
      ].join(","),
    )
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          // An ancestor with display:none does NOT change this element's own
          // computed display, so the style check below passed anything hidden
          // by a wrapper and reported it as a 0x0 target. checkVisibility walks
          // ancestors and honours the hidden attribute, which is what "is this
          // actually a target the user can hit" means.
          if (typeof element.checkVisibility === "function") {
            return element.checkVisibility({
              contentVisibilityAuto: true,
              opacityProperty: true,
              visibilityProperty: true,
            });
          }
          const style = getComputedStyle(element);
          return style.display !== "none" && style.visibility !== "hidden";
        })
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            label:
              element.getAttribute("aria-label") ??
              element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80),
            height: Math.round(bounds.height * 10) / 10,
            width: Math.round(bounds.width * 10) / 10,
          };
        })
        .filter(({ height, width }) => height < 44 || width < 44),
    );
  expect(undersized).toEqual([]);
}

for (const route of routes) {
  test(`${route} has robust landmarks, headings, contrast, and names`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto(route);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary navigation" }))
      .toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);

    const structure = await page.evaluate(() => {
      const headingLevels = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")]
        .map((heading) => Number(heading.tagName.slice(1)));
      const skippedHeadings = headingLevels
        .slice(1)
        .filter((level, index) => level > headingLevels[index] + 1);
      const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(
        (element) => element.id,
      );
      return {
        duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
        skippedHeadings,
      };
    });
    expect(structure).toEqual({ duplicateIds: [], skippedHeadings: [] });

    const accessibility = await new AxeBuilder({ page })
      .withTags(axeTags)
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await expectMinimumTargets(page);
  });

  test(`${route} reflows at narrow width with 200 percent text`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
  });
}

// The header menus hide their contents until opened, so a sweep of the closed
// page never measures them. Opening each one is the only way this check covers
// the links it now lists.
test("header menus open, meet the target floor, and close on Escape", async ({
  page,
}) => {
  await page.goto("/");

  for (const trigger of ["About", "Your account"]) {
    const button = page.getByRole("button", { name: trigger, exact: trigger === "About" });
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expectMinimumTargets(page);
    const violations = await new AxeBuilder({ page }).withTags(axeTags).analyze();
    expect(violations.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    // Escape has to hand focus back, or a keyboard user is dropped at the top
    // of the document with no idea where they are.
    await expect(button).toBeFocused();
  }
});

test("profile menu offers the shared sign-in destination", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Your account" }).click();

  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute(
    "href",
    "https://learn.project-42.dev/account",
  );
});

test("skip navigation moves keyboard focus directly to page content", async ({
  page,
}) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  expect(
    await skipLink.evaluate((link) => getComputedStyle(link).outlineStyle),
  ).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("resource discovery and opening work with keyboard input alone", async ({
  page,
}) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search the field guide" });
  await search.focus();
  await page.keyboard.type("MCP primitives and lifecycle");
  await expect(page.getByRole("status")).toHaveText("Showing 1 of 91 resources");

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("combobox", { name: "Topic", exact: true }),
  ).toBeFocused();

  const result = page.getByRole("link", {
    name: "Open MCP Primitives and Lifecycle Reference",
  });
  await result.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/resources\/mcp-primitives-reference\/?$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "MCP Primitives and Lifecycle Reference",
    }),
  ).toBeVisible();
});

test("reduced-motion mode suppresses scrolling and visible transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/diagrams/safe-agent-loop");
  const motion = await page.evaluate(() => {
    const milliseconds = (value: string) =>
      value.split(",").map((duration) => {
        const trimmed = duration.trim();
        return trimmed.endsWith("ms")
          ? Number.parseFloat(trimmed)
          : Number.parseFloat(trimmed) * 1_000;
      });
    const transitionDurations = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
      })
      .flatMap((element) => milliseconds(getComputedStyle(element).transitionDuration));
    return {
      matches: matchMedia("(prefers-reduced-motion: reduce)").matches,
      maximumTransitionMs: Math.max(0, ...transitionDurations),
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });
  expect(motion).toEqual({
    matches: true,
    maximumTransitionMs: 0.01,
    scrollBehavior: "auto",
  });
});

test("the visual-guide dialog traps focus and labels its scrollable viewport", async ({
  page,
}) => {
  await page.goto("/diagrams/safe-agent-loop");
  const trigger = page.getByRole("button", { name: /open full-screen viewer/i });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "The bounded agent loop" });
  await expect(dialog).toBeVisible();
  await expectMinimumTargets(page);
  const viewport = dialog.getByRole("region", {
    name: "The bounded agent loop zoomable image",
  });
  await expect(viewport).toHaveAttribute("tabindex", "0");

  const firstControl = dialog.getByRole("button", { name: "Zoom in" });
  await firstControl.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(viewport).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(firstControl).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
