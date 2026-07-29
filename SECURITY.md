# Security policy

Project 42 Field Guide is a public static reference application. It renders
reviewed public resources and diagrams from the reusable Project 42 Platform.
It does not authenticate learners, store learner records, or require provider
credentials in the browser.

## Supported versions

Security fixes target the current hosted release and the current default branch.
Older static builds, historical tags, arbitrary commits, and unmaintained forks
do not receive guaranteed fixes. The repository does not currently publish a
supported OCI distribution. Self-managed operators should build from reviewed
source and follow the compatibility boundary in [SUPPORT.md](SUPPORT.md).

| Surface | Security support |
| --- | --- |
| Current hosted release | Supported |
| Current default branch | Supported for source development |
| Older releases and arbitrary commits | Upgrade required |
| Modified forks | Maintainer of the fork is responsible |

## Reporting a vulnerability

Use the repository's private
[GitHub Security Advisory form](https://github.com/project42dev/guide.project-42.dev/security/advisories/new).
Do not open a public issue for a suspected vulnerability.

Include only the minimum information needed to reproduce and assess the issue:

- the affected hosted release or commit;
- the affected route, component, resource, or diagram;
- clear reproduction steps using public or synthetic data;
- expected and observed behavior;
- likely impact; and
- a proposed mitigation, if known.

Do not include credentials, tokens, tenant or resource identifiers, private
configuration, personal information, production learner data, or private
operational links. Redact screenshots and logs before attaching them.

## Response

Maintainers will privately triage the report, confirm the affected boundary,
request missing safe evidence, and coordinate remediation. Priority and timing
depend on exploitability, reader impact, affected deployments, and the safety of
the correction.

The public Field Guide repository cannot grant access to hosted identity,
account, database, or infrastructure systems. Reports involving reusable
platform code or resource contracts may be transferred privately to the
[`project42-platform`](https://github.com/project42dev/project42-platform)
security process.

## Disclosure

Please allow maintainers time to investigate and release a correction before
public disclosure. Maintainers will publish an appropriate advisory or release
note after affected users can safely update. Security or privacy risk may
require immediate behavior changes that take precedence over the normal
deprecation process.

For non-security defects and compatibility questions, follow
[SUPPORT.md](SUPPORT.md). Contributors should also review
[CONTRIBUTING.md](CONTRIBUTING.md).
