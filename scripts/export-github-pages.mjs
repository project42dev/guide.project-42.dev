import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { buildRouteInventory } from "./link-integrity.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const clientRoot = path.join(projectRoot, "dist", "client");
const workerPath = path.join(projectRoot, "dist", "server", "index.js");
const outputRoot = path.join(projectRoot, "dist", "pages");
const canonicalDomain = "guide.project-42.dev";
const publicOrigin = "https://project-42.dev";

const endpointFiles = new Map([
  ["/manifest.webmanifest", "manifest.webmanifest"],
  ["/robots.txt", "robots.txt"],
  ["/sitemap.xml", "sitemap.xml"],
]);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function outputPathForRoute(route) {
  if (route === "/") return path.join(outputRoot, "index.html");
  return path.join(outputRoot, route.replace(/^\/+/, ""), "index.html");
}

// A Worker redirect, expressed as something a static host can serve. noindex
// keeps the stub itself out of search results while the canonical link hands
// any accumulated authority to the page that replaced it.
function redirectDocument(target) {
  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta http-equiv="refresh" content="0; url=${target}">` +
    `<link rel="canonical" href="${target}">` +
    `<meta name="robots" content="noindex">` +
    `<title>Redirecting…</title></head><body>` +
    `<p>This page has moved. <a href="${target}">Continue to ${target}</a></p>` +
    `</body></html>\n`
  );
}

function unifiedTarget(route) {
  if (route === "/") return `${publicOrigin}/guide/`;
  if (route === "/diagrams") return `${publicOrigin}/guide/diagrams/`;
  if (route.startsWith("/diagrams/")) {
    return `${publicOrigin}/guide/diagrams/${route.slice("/diagrams/".length)}/`;
  }
  if (route.startsWith("/resources/")) {
    return `${publicOrigin}/guide/resources/${route.slice("/resources/".length)}/`;
  }
  return `${publicOrigin}/guide${route}/`;
}

function addStaticNavigation(html) {
  const navigation = `<script data-project42-static-navigation>
document.addEventListener("click",function(event){
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest("a[href]");
  if(!link||link.target||link.hasAttribute("download"))return;
  const url=new URL(link.href,window.location.href);
  if(url.origin!==window.location.origin)return;
  if(url.pathname===window.location.pathname&&url.search===window.location.search)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.location.assign(url.href);
},true);
</script>`;
  return html.replace("</head>", `${navigation}</head>`);
}

async function writeRoute(route, content) {
  const target = outputPathForRoute(route);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

async function main() {
  if (!(await exists(workerPath)) || !(await exists(clientRoot))) {
    throw new Error('Run "npm run build" before exporting GitHub Pages.');
  }

  const workerUrl = pathToFileURL(workerPath);
  workerUrl.searchParams.set("pages-export", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const fetchRoute = (route) =>
    worker.fetch(
      new Request(`https://${canonicalDomain}${route}`),
      {
        ASSETS: {
          fetch: async () => new Response("Not found", { status: 404 }),
        },
      },
      { waitUntil() {}, passThroughOnException() {} },
    );

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  await cp(clientRoot, outputRoot, { recursive: true });

  const inventory = buildRouteInventory();
  for (const route of inventory.htmlRoutes) {
    if (canonicalDomain === "guide.project-42.dev") {
      await writeRoute(route, redirectDocument(unifiedTarget(route)));
      continue;
    }
    const response = await fetchRoute(route);
    // GitHub Pages serves files, not a Worker, so a route the Worker redirects
    // has to be published as a redirect document or the old URL 404s on Pages
    // while working everywhere else. Following the redirect and publishing the
    // target's HTML instead would put the same page at two URLs again, which
    // is the duplication the redirect exists to remove.
    if (response.status >= 300 && response.status < 400) {
      const target = response.headers.get("location");
      if (!target) {
        throw new Error(`Cannot export ${route}: ${response.status} with no Location`);
      }
      const relativeTarget = new URL(target, `https://${canonicalDomain}`).pathname;
      await writeRoute(route, redirectDocument(relativeTarget));
      continue;
    }
    if (!response.ok) {
      throw new Error(`Cannot export ${route}: HTTP ${response.status}`);
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error(`Cannot export ${route}: expected HTML, received ${contentType}`);
    }
    await writeRoute(route, addStaticNavigation(await response.text()));
  }

  for (const [route, target] of endpointFiles) {
    const response = await fetchRoute(route);
    if (!response.ok) {
      throw new Error(`Cannot export ${route}: HTTP ${response.status}`);
    }
    await writeFile(path.join(outputRoot, target), await response.text());
  }

  const notFoundResponse = await fetchRoute("/__project42_not_found__");
  const notFoundHtml = addStaticNavigation(await notFoundResponse.text());
  await writeFile(path.join(outputRoot, "404.html"), notFoundHtml);
  await writeFile(path.join(outputRoot, ".nojekyll"), "");
  await writeFile(path.join(outputRoot, "CNAME"), `${canonicalDomain}\n`);
  await writeFile(
    path.join(outputRoot, "pages-manifest.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        canonicalDomain,
        htmlRoutes: inventory.htmlRoutes,
        endpoints: [
          ...endpointFiles.keys(),
        ],
      },
      null,
      2,
    )}\n`,
  );

  console.log(
    `GitHub Pages export ready: ${inventory.htmlRoutes.length} HTML routes and ` +
      `${endpointFiles.size} endpoints in ${outputRoot}.`,
  );
}

await main();
