# Support, compatibility, and deprecation

This document defines the public support boundary for Project 42 Field Guide. It
does not grant access to private operations and does not replace a self-managed
operator's own service, security, or data responsibilities.

## Supported surfaces

| Surface | Supported boundary |
| --- | --- |
| Hosted Field Guide | The current release at [guide.project-42.dev](https://guide.project-42.dev) |
| Source development | The current default branch with Node.js 22.13 or newer and the committed lockfile |
| Self-managed Field Guide | Best-effort source build from a reviewed commit with matching release facts |
| Modified distributions | Supported by the organization that made and operates the modification |

The repository does not currently publish a supported OCI image or a complete
tagged release for the current site version. Self-managed operators build the
static Pages artifact from reviewed source with `npm run pages:build`. Hosted
availability and source-development support do not imply operational support for
an independently modified deployment.

Project 42 Field Guide targets current stable desktop and mobile browsers.
Automated release gates exercise Chromium-based application and exported Pages
journeys; program accessibility validation supplements automation across
additional browsers and assistive technologies. Report browser-specific defects
with the exact browser, operating system, viewport, input method, and release.

## Compatibility

The generated release facts in
[`public/release-facts.json`](public/release-facts.json) identify the exact Field
Guide, platform, and content versions. A source deployment should preserve that
version set and review the matching platform commit before updating.

Stable resource and visual-guide URLs are public contracts. Reusable resource,
provider, provenance, freshness, and content schemas are owned by
[`project42-platform`](https://github.com/project42dev/project42-platform).
Compatibility changes to those contracts must be adopted through a reviewed,
versioned platform update.

The browser must not receive identity-provider configuration, credentials,
session keys, database configuration, learner records, or private operational
settings. The Field Guide renders public reference material only.

## Deprecation

Deprecations are documented in the affected release and repository guidance
before removal whenever security, privacy, or legal constraints allow. A
deprecation notice identifies:

- the behavior, route, resource, or visual guide being retired;
- the supported replacement;
- affected hosted and self-managed versions;
- migration or redirect behavior; and
- rollback or recovery considerations.

Stable routes should retain a redirect or an explicit transition experience
when practical. Security, privacy, legal, licensing, or source-provenance
corrections may require faster removal; the applicable advisory explains the
safe replacement.

## Getting help

Search the repository's
[existing issues](https://github.com/project42dev/guide.project-42.dev/issues)
before opening a new one. A useful support request includes the release,
browser or runtime, deployment mode, affected route or resource, reproduction
steps, expected behavior, observed behavior, and sanitized logs.

Never post credentials, personal information, learner records, tenant or
resource identifiers, private configuration, or private operational links. Use
[GitHub Security Advisories](SECURITY.md) for suspected vulnerabilities. For
proposed changes and local validation, read
[CONTRIBUTING.md](CONTRIBUTING.md).
