# Claude Code Labs

Hands-on workshop for getting real work done with [Claude Code](https://claude.com/claude-code).
Four modules, run in order. Each is a self-contained lab with its own README.

## Modules

| # | Module | What you learn | Status |
|---|---|---|---|
| 01 | [MCP](01-mcp/) | Connect Claude to external tools and data via the Model Context Protocol — build a chat CLI with `@mentions`, `/commands`, and model-callable tools | ✅ Ready |
| 02 | [Hooks](02-hooks/) | Automate behavior around tool calls — block dangerous actions, auto-format and type-check edits, log every call | ✅ Ready |
| 03 | [Plan Mode](03-plan-mode/) | Read-only Explore → Plan → Execute for safe multi-file changes | ✅ Ready |
| 04 | [Spec-Driven Development](04-spec-driven-development/) | Build features from an executable spec with GitHub Spec Kit | ✅ Ready |

Each module folder is a standalone project — start with its `README.md`.

## Prerequisites

- **Claude Code** installed and authenticated — `claude --version`, then `/status` inside a session.
- **Node.js 20+** and npm — modules 01, 02, 03.
- **An Anthropic API key** — module 01 (and the optional exercise in 02).
- **`jq`** on your `PATH` — module 02 hooks (`brew install jq` on macOS).
- **Python 3.11+ and [`uv`](https://docs.astral.sh/uv/)** — the Spec Kit pipeline in module 04.
- **git** on your `PATH`.

## Module 01 — MCP

Build `mcp-chat-cli`: a terminal chat app for Claude, extended with the Model
Context Protocol. Pull document content into prompts with `@mentions`, run
server-defined templates with `/commands`, and give the model tools it can call.

```bash
cd 01-mcp
npm install
```

Full setup and walkthrough in [`01-mcp/README.md`](01-mcp/README.md).

## Module 02 — Hooks

A realistic e-commerce query library used as a playground for **Claude Code hooks**:
block reads of secrets, auto-format and type-check every edit, log all tool calls,
and review new code with a second Claude instance.

```bash
cd 02-hooks
npm run setup    # installs deps + generates your local .claude/settings
```

Exercises and solution branch in [`02-hooks/README.md`](02-hooks/README.md).

## Module 03 — Plan Mode

Take a deliberately messy Express handler and refactor it into clean
route → service → repository layers **entirely through Plan Mode**, without editing
a file by hand.

```bash
cd 03-plan-mode/demo/sample-project
npm install
npm test         # two tests should pass — that's your green baseline
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
