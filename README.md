# Project 42 Field Guide

The dedicated practical-reference experience at
[guide.project-42.dev](https://guide.project-42.dev): free, provider-neutral AI
guides, workflows, commands, comparisons, checklists, and troubleshooting help.

## Develop

```bash
npm ci
npm run dev
```

## Verify

```bash
npm run governance:check
npm run lint
npm test
```

The site consumes the versioned open-source learning core from
[`project42dev/project42-platform`](https://github.com/project42dev/project42-platform).
The current catalog contains practical references for prompting, context, research,
verification, coding agents, MCP, orchestration, provider workflows, evaluation,
safety, troubleshooting, and operations. Resources include visible ownership,
freshness, provenance, and reusable artifacts.

The current site also includes eight accessible visual guides for learning evidence,
grounded research, prompting, provider selection, safe tools, bounded agents,
multi-agent handoffs, and human-gated content freshness. Mermaid sources live in
`@project42/platform` under `content/diagrams/` as the single canonical source of
truth; reviewed SVG and public source artifacts are generated ahead of deployment.
See [`docs/diagram-authoring.md`](docs/diagram-authoring.md) for the validation,
accessibility, and security contract.

## Contributing and support

- [Contributing](CONTRIBUTING.md) covers repository ownership, local setup,
  validation, pull requests, and review expectations.
- [Security](SECURITY.md) provides the private vulnerability-reporting process.
- [Support, compatibility, and deprecation](SUPPORT.md) defines supported
  surfaces, version boundaries, retirement notices, and public help.

`npm run governance:check` rejects missing, empty, private-data-bearing,
unlinked, or broken governance documents. Project 42 Field Guide is available
under the [Apache License 2.0](LICENSE).

## Current release facts

- Site release `0.6.2`
- Platform package `0.86.0`
- Content release `0.42.0`
- 91 Field Guide resources
- 91 practical resources and 4 provider scopes

These facts are generated from `package.json` and the tagged platform catalog into
[`public/release-facts.json`](public/release-facts.json). `npm run facts:check`
fails when versions, licenses, repositories, issue links, counts, or provider coverage
drift.

## Repositories

- `project-42.dev` — public landing experience and brand
- `learn.project-42.dev` — self-paced learning experience
- `guide.project-42.dev` — this Field Guide application
- `project42-platform` — reusable Apache-2.0 platform and CC BY 4.0 curriculum
- `project42dev.github.io` — transitional public site

## Deployment

The canonical public instance deploys from this repository to GitHub Pages and is
served at <https://guide.project-42.dev>. Cloudflare manages DNS only.

`npm run pages:build` produces the complete static artifact in `dist/pages`. The
GitHub Pages workflow validates the application and exported artifact before deploying
the exact merged `main` commit. OpenAI Sites is not a production or custom-domain
target for this repository. Production configuration and learner secrets never belong
in git.

The platform dependency uses a reviewed release tag and the lockfile resolves that
tag to an exact commit. npm `allowScripts` permits only that release dependency to
run its `prepare` script, which generates the published `dist` entrypoint by running
the catalog generator and TypeScript compiler. Changing the platform release requires
reviewing its package scripts and updating the allow-list entry in the same change.
