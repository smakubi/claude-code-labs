# Claude Code Bootcamp

Hands-on workshop for getting real work done with [Claude Code](https://claude.com/claude-code).
Four modules, run in order. Each has a concept doc, a guided demo, and a lab you drive yourself.

## Modules

| # | Module | What you learn | Status |
|---|---|---|---|
| 01 | [MCP](01-mcp/) | Connect Claude Code to external tools and data via the Model Context Protocol | 🚧 Coming soon |
| 02 | [Hooks](02-hooks/) | Automate behavior around tool calls and sessions via `settings.json` | 🚧 Coming soon |
| 03 | [Plan Mode](03-plan-mode/) | Read-only Explore → Plan → Execute for safe multi-file changes | ✅ Ready |
| 04 | [Spec-Driven Development](04-spec-driven-development/) | Build features from an executable spec with GitHub Spec Kit | ✅ Ready |

Each module folder contains:

```
NN-module/
├── README.md   # the lab guide — start here
└── demo/       # guided walkthrough (README + sample project)
```

## Prerequisites

- **Claude Code** installed and authenticated — `claude --version`, then `/status` inside a session.
- **Node.js 20+** — for the Plan Mode sample project.
- **Python 3.11+ and [`uv`](https://docs.astral.sh/uv/)** — for the Spec Kit pipeline in module 04.
- **git** on your `PATH`.

## Module 03 — Plan Mode

Take a deliberately messy Express handler and refactor it into clean
route → service → repository layers **entirely through Plan Mode**, without editing
a file by hand.

```bash
cd 03-plan-mode/demo/sample-project
npm install
npm test        # two tests should pass — that's your green baseline
```

Then follow [`03-plan-mode/demo/README.md`](03-plan-mode/demo/README.md), and do the lab in
[`03-plan-mode/README.md`](03-plan-mode/README.md).

## Module 04 — Spec-Driven Development

Build a Tasks API end-to-end by walking Spec Kit's pipeline
(`/speckit-constitution → specify → clarify → plan → tasks → analyze → implement`).

- [`demo/tasks-api-reference/`](04-spec-driven-development/demo/tasks-api-reference/) — the raw Spec Kit scaffold (your starting point).
- [`demo/tasks-api-example-output/`](04-spec-driven-development/demo/tasks-api-example-output/) — the full worked example (the answer key).

Follow [`04-spec-driven-development/demo/README.md`](04-spec-driven-development/demo/README.md),
then do the lab in [`04-spec-driven-development/README.md`](04-spec-driven-development/README.md).
