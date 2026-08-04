# Repository boundary

This file states what this repository is for, what must never be added to it,
and where to look instead. It exists because two codebases ended up in the
wrong repositories, and both got there through a directory convention that
nobody enforced.

Governing decision: **ADR-0017**, Orchard and the Foundry layer separation.

## What this is

**The Field Guide delivery surface: reference material, decision aids, and resource packs.**

- Visibility: **public**

## What must never go here

| Do not add | Because | Where it belongs |
|---|---|---|
| **Learn modules or course progression** | Two surfaces with two different jobs. | `learn.project-42.dev` |
| **Canonical content** | Delivery consumes the released platform package. | `project42-platform` |
| **Any call to a model at read time** | Same rule as Learn: produced at publish time, stored, served. | Publish-time rendering in `orchard` |

## Looking for something else?

| Looking for | It lives in |
|---|---|
| The content, the content model, and the schemas | `project42-platform` |
| The content lifecycle tool: discovery, authoring, currency | `orchard` |
| The public marketing and entry surface | `project-42.dev` |
| The Learn delivery surface | `learn.project-42.dev` |
| Learner account and profile | `account.project-42.dev` |
| Owner administration | `admin.project-42.dev` |
| Planning, sprints, ADRs, board records | `project42dev-ops`, private |
| An Azure AI Foundry deployment framework | `homestead-foundry` |
| One owner's Foundry instance and model registry | `my-homestead-foundry` |

## The rule in one line

**This repository serves what was already made. It never makes anything.**
