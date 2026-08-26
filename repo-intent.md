# Repo intent — guide.project-42.dev

**Project 42 Field Guide — practical AI references, workflows, commands, comparisons.**

## What this repo is

The dedicated practical-reference experience at guide.project-42.dev: free,
provider-neutral guides, workflows, commands, comparisons, checklists, and
troubleshooting help — covering prompting, context, research, verification, coding
agents, MCP, orchestration, provider workflows, evaluation, safety,
troubleshooting, and operations. Also includes eight accessible visual guides
(learning evidence, grounded research, prompting, provider selection, safe tools,
bounded agents, multi-agent handoffs, human-gated content freshness).

## Shape

- Next.js app, same verify pipeline as `learn.project-42.dev`
  (`npm run governance:check`, `lint`, `test`)
- Mermaid diagram sources live upstream in `project42-platform` under
  `content/diagrams/` as the single canonical source of truth; this repo generates
  reviewed SVG/public artifacts ahead of deployment rather than owning the sources

## How it relates to other repos

- Consumes the versioned open-source learning core from
  **`project42dev/project42-platform`**, including its diagram sources

## Status

Active.
