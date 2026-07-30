import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const FULL_COMMIT_SHA = /^[0-9a-f]{40}$/;
const ACTION_REFERENCE =
  /^\s*(?:-\s*)?uses:\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_./-]+)@([^\s#]+)(?:\s+#.*)?$/gm;

const PUBLICATION_MARKERS = [
  /\bactions\/upload-pages-artifact@/i,
  /\bactions\/deploy-pages@/i,
  /\bpeaceiris\/actions-gh-pages@/i,
  /\bsoftprops\/action-gh-release@/i,
  /\bdocker\/build-push-action@/i,
  /\bnpm\s+publish\b/i,
  /\bpnpm\s+publish\b/i,
  /\byarn\s+npm\s+publish\b/i,
  /\bwrangler\s+(?:deploy|publish)\b/i,
  /\bcloudflare\s+pages\s+deploy\b/i,
  /\bgh\s+release\s+create\b/i,
  /\bdocker\s+push\b/i,
  /\baz\s+staticwebapp\s+upload\b/i,
  /\bgit\s+push\b[^\n]*\bgh-pages\b/i,
];

function workflowError(code, message) {
  return { code, message };
}

function uncommented(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => !/^\s*#/.test(line))
    .join("\n");
}

function rootBlock(lines, key) {
  const start = lines.findIndex((line) =>
    new RegExp(`^${key}:\\s*(.*)$`).test(line),
  );
  if (start < 0) {
    return null;
  }

  const match = lines[start].match(new RegExp(`^${key}:\\s*(.*)$`));
  const body = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^[^\s#][^:]*:/.test(lines[index])) {
      break;
    }
    body.push(lines[index]);
  }
  return { inline: match?.[1]?.trim() ?? "", body };
}

function jobBlocks(lines) {
  const jobsStart = lines.findIndex((line) => /^jobs:\s*$/.test(line));
  if (jobsStart < 0) {
    return [];
  }

  const jobs = [];
  let current = null;
  for (let index = jobsStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^[^\s#][^:]*:/.test(line)) {
      break;
    }

    const jobMatch = line.match(/^  ([A-Za-z0-9_-]+):\s*$/);
    if (jobMatch) {
      if (current) {
        jobs.push(current);
      }
      current = { name: jobMatch[1], lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) {
    jobs.push(current);
  }
  return jobs;
}

function permissionMap(job) {
  const index = job.lines.findIndex((line) => /^    permissions:\s*/.test(line));
  if (index < 0) {
    return null;
  }

  const inline = job.lines[index].replace(/^    permissions:\s*/, "").trim();
  if (inline === "{}") {
    return new Map();
  }

  const permissions = new Map();
  if (inline) {
    permissions.set("__inline__", inline);
    return permissions;
  }

  for (let cursor = index + 1; cursor < job.lines.length; cursor += 1) {
    const line = job.lines[cursor];
    if (/^    [^\s#][^:]*:/.test(line)) {
      break;
    }
    const match = line.match(/^      ([a-z-]+):\s*(read|write|none)\s*$/);
    if (match) {
      permissions.set(match[1], match[2]);
    }
  }
  return permissions;
}

function hasPublicationMarker(text) {
  return PUBLICATION_MARKERS.some((pattern) => pattern.test(text));
}

function checkoutSteps(job) {
  const steps = [];
  for (let index = 0; index < job.lines.length; index += 1) {
    if (!/^\s*-\s+uses:\s*actions\/checkout@/i.test(job.lines[index])) {
      continue;
    }

    const stepIndent = job.lines[index].match(/^(\s*)-/)?.[1]?.length ?? 0;
    const stepLines = [job.lines[index]];
    for (let cursor = index + 1; cursor < job.lines.length; cursor += 1) {
      const nextStep = job.lines[cursor].match(/^(\s*)-\s+/);
      if (nextStep && nextStep[1].length === stepIndent) {
        break;
      }
      stepLines.push(job.lines[cursor]);
    }
    steps.push({ indent: stepIndent, lines: stepLines });
  }
  return steps;
}

function jobCondition(job) {
  return (
    job.lines
      .find((line) => /^    if:\s*/.test(line))
      ?.replace(/^    if:\s*/, "")
      .trim() ?? ""
  );
}

function hasPositivePushRefGuard(condition) {
  const normalized = condition
    .replace(/^\$\{\{\s*/, "")
    .replace(/\s*\}\}$/, "")
    .replace(/\s+/g, "");
  const exactRef =
    /^github\.event_name==(['"])push\1&&github\.ref==(['"])refs\/(?:heads|tags)\/[^'"]+\2$/.test(
      normalized,
    );
  const tagPrefix =
    /^github\.event_name==(['"])push\1&&startsWith\(github\.ref,(['"])refs\/tags\/\2\)$/.test(
      normalized,
    );
  return exactRef || tagPrefix;
}

function checkoutDoesNotPersistCredentials(step) {
  const withIndent = step.indent + 2;
  const propertyIndent = step.indent + 4;
  const withIndex = step.lines.findIndex((line) =>
    new RegExp(`^\\s{${withIndent}}with:\\s*$`).test(line),
  );
  if (withIndex < 0) {
    return false;
  }

  for (let index = withIndex + 1; index < step.lines.length; index += 1) {
    const line = step.lines[index];
    const leading = line.match(/^(\s*)/)?.[1]?.length ?? 0;
    if (line.trim() && leading <= withIndent) {
      break;
    }
    if (
      new RegExp(
        `^\\s{${propertyIndent}}persist-credentials:\\s*false\\s*$`,
      ).test(line)
    ) {
      return true;
    }
  }
  return false;
}

function validIssueWrite(workflowText, jobText) {
  return (
    /^\s{2}issues:\s*$/m.test(workflowText) &&
    (/\bgh\s+issue\s+/i.test(jobText) ||
      /github-actions-issue-to-work-item@/i.test(jobText))
  );
}

function validContentsWrite(jobText) {
  return (
    /\bgh\s+release\s+create\b/i.test(jobText) ||
    /\bsoftprops\/action-gh-release@/i.test(jobText) ||
    /\bgit\s+push\b/i.test(jobText)
  );
}

function validPackagesWrite(jobText) {
  return (
    /\bdocker\s+push\b/i.test(jobText) ||
    /\bdocker\/build-push-action@/i.test(jobText) ||
    /\b(?:npm|pnpm)\s+publish\b/i.test(jobText)
  );
}

export function auditWorkflowText(name, source) {
  const text = uncommented(source);
  const lines = text.split(/\r?\n/);
  const errors = [];

  for (const match of text.matchAll(ACTION_REFERENCE)) {
    if (!FULL_COMMIT_SHA.test(match[2])) {
      errors.push(
        workflowError(
          "MUTABLE_ACTION",
          `${name}: ${match[1]} must use an immutable 40-character commit SHA, not ${match[2]}.`,
        ),
      );
    }
  }

  const rootPermissions = rootBlock(lines, "permissions");
  if (!rootPermissions || rootPermissions.inline !== "{}") {
    errors.push(
      workflowError(
        "ROOT_PERMISSIONS_NOT_EMPTY",
        `${name}: declare an empty root permissions map and grant permissions per job.`,
      ),
    );
  }

  const jobs = jobBlocks(lines);
  if (jobs.length === 0) {
    errors.push(workflowError("NO_JOBS", `${name}: no jobs were found.`));
  }

  const manual =
    /^\s{2}workflow_dispatch:\s*(?:\{\})?\s*$/m.test(text) ||
    /^on:\s*workflow_dispatch\s*$/m.test(text) ||
    /^on:\s*\[[^\]]*\bworkflow_dispatch\b[^\]]*\]\s*$/m.test(text);
  if (manual && hasPublicationMarker(text)) {
    errors.push(
      workflowError(
        "MANUAL_PUBLISH_REACHABLE",
        `${name}: workflow_dispatch validation must be separate from every publish or deploy path.`,
      ),
    );
  }

  for (const job of jobs) {
    const jobText = job.lines.join("\n");
    const permissions = permissionMap(job);
    const publication = hasPublicationMarker(jobText);

    if (!permissions) {
      errors.push(
        workflowError(
          "MISSING_JOB_PERMISSIONS",
          `${name}:${job.name}: declare job-scoped permissions.`,
        ),
      );
    } else {
      for (const [scope, level] of permissions) {
        if (scope === "__inline__") {
          errors.push(
            workflowError(
              "NON_SCOPED_JOB_PERMISSIONS",
              `${name}:${job.name}: ${level} is not a least-privilege job permission map.`,
            ),
          );
          continue;
        }
        if (level !== "write") {
          continue;
        }

        const justified =
          (scope === "pages" && /\bactions\/deploy-pages@/i.test(jobText)) ||
          (scope === "id-token" &&
            (/\bactions\/deploy-pages@/i.test(jobText) ||
              /\bactions\/attest@/i.test(jobText))) ||
          (scope === "attestations" &&
            /\bactions\/attest@/i.test(jobText)) ||
          (scope === "artifact-metadata" &&
            /\bactions\/attest@/i.test(jobText)) ||
          (scope === "issues" && validIssueWrite(text, jobText)) ||
          (scope === "contents" && validContentsWrite(jobText)) ||
          (scope === "packages" && validPackagesWrite(jobText));
        if (!justified) {
          errors.push(
            workflowError(
              "EXCESS_WRITE_PERMISSION",
              `${name}:${job.name}: ${scope}: write is not justified by this job's operations.`,
            ),
          );
        }
      }

      if (/\bactions\/deploy-pages@/i.test(jobText)) {
        if (
          permissions.get("pages") !== "write" ||
          permissions.get("id-token") !== "write"
        ) {
          errors.push(
            workflowError(
              "MISSING_DEPLOY_PERMISSIONS",
              `${name}:${job.name}: GitHub Pages deployment requires only pages: write and id-token: write.`,
            ),
          );
        }
      }

      if (
        manual &&
        [...permissions.values()].some((level) => level === "write")
      ) {
        errors.push(
          workflowError(
            "MANUAL_WRITE_PERMISSION",
            `${name}:${job.name}: manual validation jobs must be read-only.`,
          ),
        );
      }
    }

    for (const step of checkoutSteps(job)) {
      if (!checkoutDoesNotPersistCredentials(step)) {
        errors.push(
          workflowError(
            "PERSISTED_CHECKOUT_CREDENTIALS",
            `${name}:${job.name}: checkout must set persist-credentials: false.`,
          ),
        );
      }
    }

    if (publication && !hasPositivePushRefGuard(jobCondition(job))) {
      errors.push(
        workflowError(
          "MISSING_PUBLISH_GUARD",
          `${name}:${job.name}: publication requires a positive push event and exact branch or tag guard.`,
        ),
      );
    }
  }

  if (hasPublicationMarker(text)) {
    const concurrency = rootBlock(lines, "concurrency");
    const concurrencyText = concurrency
      ? [concurrency.inline, ...concurrency.body].join("\n")
      : "";
    if (
      !concurrency ||
      !/^\s{2}group:\s*\S+/m.test(concurrencyText) ||
      !/^\s{2}cancel-in-progress:\s*(?:true|false)\s*$/m.test(concurrencyText)
    ) {
      errors.push(
        workflowError(
          "MISSING_DEPLOY_CONCURRENCY",
          `${name}: publishing workflows require an explicit concurrency group and cancellation policy.`,
        ),
      );
    }
  }

  return errors;
}

export async function auditWorkflowDirectory(directory) {
  const entries = (await readdir(directory, { withFileTypes: true }))
    .filter(
      (entry) =>
        entry.isFile() && /\.(?:yaml|yml)$/i.test(entry.name),
    )
    .sort((left, right) => left.name.localeCompare(right.name));

  const results = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    const source = await readFile(file, "utf8");
    results.push(...auditWorkflowText(entry.name, source));
  }
  return results;
}

async function main() {
  const directory = path.resolve(process.argv[2] ?? ".github/workflows");
  const errors = await auditWorkflowDirectory(directory);
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[${error.code}] ${error.message}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log(`Workflow governance passed for ${directory}.`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  await main();
}
