# Claude Code Bootcamp — Workshop Materials

Hands-on materials for two segments of the Claude Code bootcamp. Each part has a
concept doc, a guided demo, and a lab you drive yourself.

| Part | Topic | Start here |
|---|---|---|
| **[Part 3](part-3-claude-plan-mode/)** | **Plan Mode** — read-only Explore → Plan → Execute | [demo](part-3-claude-plan-mode/demo/README.md) → [lab](part-3-claude-plan-mode/README.md) |
| **[Part 4](part-4-spec-driven-dev/)** | **Spec-Driven Development** with GitHub Spec Kit | [demo](part-4-spec-driven-dev/demo/README.md) → [lab](part-4-spec-driven-dev/README.md) |

## Part 3 — Plan Mode

Take a deliberately messy Express handler and refactor it into clean
route → service → repository layers **entirely through Plan Mode**, without
editing a file by hand. Starting project: [`demo/sample-project/`](part-3-claude-plan-mode/demo/sample-project/).

```bash
cd part-3-claude-plan-mode/demo/sample-project
npm install
npm test        # two tests should pass — that's your green baseline
```

## Part 4 — Spec-Driven Development

Build a Tasks API end-to-end by walking Spec Kit's pipeline
(`/speckit-constitution → specify → clarify → plan → tasks → analyze → implement`).

- [`demo/tasks-api-reference/`](part-4-spec-driven-dev/demo/tasks-api-reference/) — the raw Spec Kit scaffold (your starting point).
- [`demo/tasks-api-example-output/`](part-4-spec-driven-dev/demo/tasks-api-example-output/) — the full worked example (the answer key).

Prereqs: Claude Code (authenticated), Python 3.11+ with [`uv`](https://docs.astral.sh/uv/), and `git`.

## Prerequisites

- **Claude Code** installed and authenticated (`claude --version`, `/status`).
- **Node.js 20+** for the Part 3 project.
- **Python 3.11+ and `uv`** for the Part 4 Spec Kit pipeline.
