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
Release `0.7.0` renders the expanded seven-module AI Foundations path and its
evidence-producing practice activities.
Progress is deliberately device-local in the current MVP and can be exported as a
portable JSON record or CSV transcript. Account-backed learning records remain a later
release.

## Repositories

- `project-42.dev` — hosted public experience and brand
- `project42-platform` — reusable Apache-2.0 platform and CC BY 4.0 curriculum
- `project42dev-ops` — private planning and operations
- `project42dev.github.io` — transitional public MVP

## Deployment

The application builds to a Cloudflare Worker-compatible output through vinext and the
Sites build adapter. Production configuration and learner secrets never belong in git.
