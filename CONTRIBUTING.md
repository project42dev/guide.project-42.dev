# Contributing to Project 42 Field Guide

Thank you for helping improve the public Project 42 practical-reference
experience. This repository owns the Field Guide application at
[guide.project-42.dev](https://guide.project-42.dev), including discovery,
resource presentation, visual-guide interactions, and integration with the
reusable Project 42 Platform.

## Before you begin

Choose the repository that owns the change:

- Field Guide application behavior and presentation belong here.
- Reusable resource contracts, schemas, provider metadata, and source material
  belong in
  [`project42-platform`](https://github.com/project42dev/project42-platform).
- Learning paths, assessments, learner profiles, and progress belong in
  [`learn.project-42.dev`](https://github.com/project42dev/learn.project-42.dev).
- The public landing experience and shared brand belong in
  [`project-42.dev`](https://github.com/project42dev/project-42.dev).

Never commit credentials, access tokens, private operational records, tenant or
resource identifiers, personal information, or production learner data. Use
synthetic fixtures and public example values only. Report suspected
vulnerabilities through the private process in [SECURITY.md](SECURITY.md), not a
public issue.

Stable resource and visual-guide URLs are public contracts. Reuse public
contracts from `@project42/platform` instead of copying them into this
application. New interaction patterns require keyboard, zoom and reflow,
contrast, screen-reader, and reduced-motion consideration.

## Local development

Use Node.js 22.13 or newer and the committed npm lockfile. Install the
Playwright Chromium binary used by browser and accessibility checks:

```text
npm ci
npx playwright install chromium
npm run dev
```

These commands are the same in PowerShell, Command Prompt, bash, and zsh. On a
Linux development host that does not already provide Chromium system libraries,
run `npx playwright install --with-deps chromium` instead. This may require the
host's normal package-administration privileges.

The Field Guide is a public static application. Do not add identity credentials,
session keys, provider secrets, database identifiers, or private operational
configuration to repository files or build variables.

## Validation

Run the narrowest relevant checks while developing and the complete gate before
requesting review:

```text
npm run governance:check
npm run workflows:check
npm run lint
npm run typecheck
npm test
npm run check
```

`npm run check` validates workflow security, release facts, repository
governance, generated brand and diagram assets, lint and types, the application
and exported Pages builds, links, browser journeys, and accessibility
assertions.

Documentation-only changes must still pass `npm run governance:check` and any
link checks affected by the change. Update tests when behavior or a public
contract changes.

## Pull requests

Keep each pull request focused and explain:

- what changed and why;
- the reader, contributor, or operator impact;
- the tests and manual checks performed;
- compatibility, accessibility, privacy, freshness, and rollback implications;
  and
- any public GitHub issue that provides context.

Do not place private planning links, private work-item references, personal
information, credentials, or operational identifiers in a public branch,
commit body, pull-request description, screenshot, fixture, or test output.
Maintainers may add internal traceability through approved private mechanisms.

Reviewers verify repository ownership, public and private boundaries, stable
URLs, platform compatibility, provenance and freshness behavior, tests,
accessible interaction, and documentation. A green check is necessary but does
not replace review.

## Security

Read [SECURITY.md](SECURITY.md) before reporting a vulnerability. For supported
versions, compatibility, deprecation, and general help, see
[SUPPORT.md](SUPPORT.md).
