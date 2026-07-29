import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  auditWorkflowDirectory,
  auditWorkflowText,
} from "../scripts/workflow-governance.mjs";

const checkoutSha = "3d3c42e5aac5ba805825da76410c181273ba90b1";
const uploadSha = "fc324d3547104276b827a68afc52ff2a11cc49c9";
const workflows = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.github/workflows",
);

const readOnlyValidation = `name: Safe validation

on:
  pull_request:
  workflow_dispatch:

permissions: {}

jobs:
  validate:
    runs-on: ubuntu-24.04
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@${checkoutSha}
        with:
          persist-credentials: false
      - run: npm test
`;

const pagesPublication = `name: Pages publication

on:
  push:
    branches: [main]

permissions: {}

concurrency:
  group: pages-\${{ github.repository_id }}
  cancel-in-progress: false

jobs:
  publish:
    if: \${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}
    runs-on: ubuntu-24.04
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@${checkoutSha}
        with:
          persist-credentials: false
      - uses: actions/upload-pages-artifact@${uploadSha}
`;

function expectRejection(name, source, code) {
  const errors = auditWorkflowText(name, source);
  assert.ok(
    errors.some((error) => error.code === code),
    `expected ${code}; received ${JSON.stringify(errors)}`,
  );
}

test("accepts a read-only manual validation workflow", () => {
  assert.deepEqual(
    auditWorkflowText("safe-validation.yml", readOnlyValidation),
    [],
  );
});

test("accepts a positively guarded publication workflow", () => {
  assert.deepEqual(
    auditWorkflowText("pages-publication.yml", pagesPublication),
    [],
  );
});

test("rejects mutable action references", () => {
  expectRejection(
    "mutable-action.yml",
    readOnlyValidation.replace(checkoutSha, "v7"),
    "MUTABLE_ACTION",
  );
});

test("rejects mutable reusable workflow and action-subpath references", () => {
  const subpathReference = readOnlyValidation.replace(
    `actions/checkout@${checkoutSha}`,
    "project42dev/example/.github/actions/check@v1",
  );
  expectRejection(
    "mutable-action-subpath.yml",
    subpathReference,
    "MUTABLE_ACTION",
  );
});

test("rejects publishing without a positive push and ref guard", () => {
  expectRejection(
    "missing-guard.yml",
    pagesPublication.replace(
      "    if: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}\n",
      "",
    ),
    "MISSING_PUBLISH_GUARD",
  );
});

test("rejects excess write permissions", () => {
  expectRejection(
    "excess-permissions.yml",
    readOnlyValidation.replace("contents: read", "contents: write"),
    "EXCESS_WRITE_PERMISSION",
  );
});

test("rejects non-scoped aggregate job permissions", () => {
  expectRejection(
    "aggregate-permissions.yml",
    readOnlyValidation.replace(
      "    permissions:\n      contents: read",
      "    permissions: write-all",
    ),
    "NON_SCOPED_JOB_PERMISSIONS",
  );
});

test("rejects persisted checkout credentials", () => {
  expectRejection(
    "persisted-credentials.yml",
    readOnlyValidation.replace(
      "persist-credentials: false",
      "persist-credentials: true",
    ),
    "PERSISTED_CHECKOUT_CREDENTIALS",
  );
});

test("rejects a checkout property outside its with map", () => {
  expectRejection(
    "misplaced-checkout-property.yml",
    readOnlyValidation.replace(
      "        with:\n          persist-credentials: false",
      "        env:\n          persist-credentials: false",
    ),
    "PERSISTED_CHECKOUT_CREDENTIALS",
  );
});

test("rejects publish or deploy paths reachable from manual validation", () => {
  const manualPublication = pagesPublication.replace(
    "  push:\n    branches: [main]",
    "  push:\n    branches: [main]\n  workflow_dispatch: {}",
  );
  expectRejection(
    "manual-publication.yml",
    manualPublication,
    "MANUAL_PUBLISH_REACHABLE",
  );
});

test("rejects deployment commands reachable from manual validation", () => {
  expectRejection(
    "manual-deploy-command.yml",
    readOnlyValidation.replace("npm test", "npx wrangler deploy"),
    "MANUAL_PUBLISH_REACHABLE",
  );
});

test("the checked-in workflows satisfy the governance contract", async () => {
  assert.deepEqual(await auditWorkflowDirectory(workflows), []);
});
