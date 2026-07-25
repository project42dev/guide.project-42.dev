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
Release `0.9.0` renders the complete sixteen-module AI Foundations path, including
evidence-based research, writing, coding and analysis, safe tool use, and a scored
practical capstone. Learners can submit the required capstone artifacts, score the
evidence rubric, resume locally, and export the result in a portable JSON record or
CSV transcript. Account-backed cross-device learning records remain active
implementation work.

## Repositories

- `project-42.dev` — hosted public experience and brand
- `project42-platform` — reusable Apache-2.0 platform and CC BY 4.0 curriculum
- `project42dev-ops` — private planning and operations
- `project42dev.github.io` — transitional public site

## Deployment

The application builds to a Cloudflare Worker-compatible output through vinext and the
Sites build adapter. Production configuration and learner secrets never belong in git.

The platform dependency is pinned to an audited commit. npm `allowScripts` permits
only that exact Git dependency to run its `prepare` script, which generates the
published `dist` entrypoint by running the catalog generator and TypeScript compiler.
Changing the platform commit requires reviewing its package scripts and updating the
allow-list entry in the same change.
