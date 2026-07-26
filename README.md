# Project 42

The public Project 42 learning experience: free, provider-neutral AI learning paths,
knowledge checks, progress, badges, and a practical field guide.

## Develop

```bash
npm ci
npm run dev
```

## Verify

```bash
npm run lint
npm test
```

The site consumes the versioned open-source learning core from
[`project42dev/project42-platform`](https://github.com/project42dev/project42-platform).
The current catalog includes the complete twelve-module Reliable Agent Workflows path
alongside the sixteen-module AI Foundations path. Its practical capstone includes complete
and deliberately flawed calibration packages, eight required operating artifacts,
criterion-level evidence mapping, failed-submission revision, a 100-point rubric,
and the Reliable Agent Operator badge. Profiles preserve attempts, capstone
revisions, evidence links, badges, and portable JSON/CSV exports in device-local
storage. Account-backed cross-device learning records remain active implementation
work.

The current site also includes eight accessible visual guides for learning evidence,
grounded research, prompting, provider selection, safe tools, bounded agents,
multi-agent handoffs, and human-gated content freshness. Mermaid files under
`diagrams/` are the editable source of truth; reviewed SVG and public source
artifacts are generated ahead of deployment. See
[`docs/diagram-authoring.md`](docs/diagram-authoring.md) for the validation,
accessibility, and security contract.

## Current release facts

- Site release `0.16.0`
- Platform package `0.37.0`
- Content release `0.30.0`
- 6 learning paths, 55 assessed modules, 49 evidence activities, and 257 reviewed questions
- 50 practical resources and 4 provider scopes

These facts are generated from `package.json` and the tagged platform catalog into
[`public/release-facts.json`](public/release-facts.json). `npm run facts:check`
fails when versions, licenses, repositories, issue links, counts, or provider coverage
drift.

## Repositories

- `project-42.dev` — hosted public experience and brand
- `project42-platform` — reusable Apache-2.0 platform and CC BY 4.0 curriculum
- `project42dev-ops` — private planning and operations
- `project42dev.github.io` — transitional public site

## Deployment

The application builds to a Cloudflare Worker-compatible output through vinext and the
Sites build adapter. Production configuration and learner secrets never belong in git.

The platform dependency uses a reviewed release tag and the lockfile resolves that
tag to an exact commit. npm `allowScripts` permits only that release dependency to
run its `prepare` script, which generates the published `dist` entrypoint by running
the catalog generator and TypeScript compiler. Changing the platform release requires
reviewing its package scripts and updating the allow-list entry in the same change.
