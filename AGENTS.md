# AGENTS.md

## Purpose

This repository preserves Field Guide content and generates path-preserving redirects
from `guide.project-42.dev` to canonical `/guide` routes on `project-42.dev`.

## Stack

- TypeScript, React, Next-compatible app router through vinext
- Cloudflare Worker-compatible deployment
- Reusable learning contracts from `@project42/platform`

## Commands

```bash
npm ci
npm run dev
npm run lint
npm test
```

## Rules

1. Public Field Guide contracts come from `project42-platform`; do not duplicate them here.
2. Stable resource URLs are public contracts.
3. Learning paths, learner progress, and canonical Field Guide rendering belong on
   the unified `project-42.dev` origin.
4. No secrets, private PMO material, or production learner data.
5. New interaction types require keyboard and reduced-motion review.
6. Build, lint, and rendered-route tests must pass before release.
