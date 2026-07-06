# Live Demo: Spec-Driven Development

### Claude Code Labs — Module 04

---

## COLD OPEN (~30 seconds)

**SAY:** Here is the most expensive mistake in software. You write a prompt: "add photo sharing to my app." The agent starts coding. Four hours later you have 800 lines — and you discover it assumed public albums, no size limits, and a schema you can't migrate. That's not an agent problem. That's a specification problem. You asked it to guess, and it did. Spec-Driven Development stops the guessing. You write the intent first, make it executable, and the agent builds to it. The spec is the source of truth. The code is a build artifact of the spec. That is what we are doing today.

---

## BEAT 1 — Setup and Init (~45s)

**SAY:** We need an empty directory. Python 3.11 or higher, `uv`, git, and Claude Code authenticated. That's it. No application scaffold yet. Watch what `init` actually creates.

**DO:**

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init tasks-api --integration claude --script sh
cd tasks-api
```

**SAY:** Look at what appeared. `.claude/skills/speckit-*/SKILL.md` — that is the workflow. `.specify/` — that is where every artifact will land. No `src/`. No `index.ts`. No `package.json` yet. This is intentional. We are building the intent before we build the thing.

**DO:**

```bash
claude
```

Type `/` inside Claude Code and confirm the `speckit-*` commands are listed. If they are missing, exit and reopen `claude` from the project root — skills load at session start.

---

## BEAT 2 — Phase 0: Constitution (~60s)

**SAY:** Every team has conventions. They live in a Confluence page nobody reads after week two, or a Slack message that scrolled away. The constitution changes that. It is five lines you write once, and every downstream phase must respect it. Not as a suggestion — as a gate. Let me show you what that means.

**DO:**

```
/speckit-constitution The project follows five principles:
1. Tests before implementation — every feature ships with a failing test first.
2. No untyped code — TypeScript strict mode, no `any` without a comment.
3. Errors as values — throw typed Error subclasses, never strings.
4. One responsibility per file — a route file has no business logic; a service has no HTTP.
5. Data safety over convenience — persistence must be crash-safe (atomic writes, no partial states).
```

**SAY:** That writes `.specify/memory/constitution.md`. Every phase from here runs a Constitution Check. If `/speckit-plan` generates a design that violates principle four — a route file with business logic baked in — it will not advance. Your conventions stop being reminders. They become rules the tool enforces. That is the compounding value of starting here.

---

## BEAT 3 — Phase 1: Specify (~90s)

**SAY:** Now we describe what we want to build. Plain English. Not pseudocode, not a schema, not an API contract — just the intent. Watch what the tool does with it.

**DO:**

```
/speckit-specify Build a small Tasks API that lets a single user create tasks
with a title and an optional due date, list their tasks, mark one complete,
and delete one. Users need to see overdue tasks at a glance and never lose
data on a crash. There is no authentication in this release — one user, one
process.
```

**SAY:** That paragraph is maybe 60 words. What comes back is a structured spec at `specs/001-tasks-api/spec.md` — expect four user stories, around fifteen numbered functional requirements (`FR-001`, `FR-002`...), six measurable success criteria (`SC-001`...), edge cases listed explicitly, eight or so assumptions written out, and a readiness assessment. Here is what matters: the FRs are numbered. The SCs are measurable. Those numbers become the chain-of-custody between every artifact we generate from here. A task in phase three will be tagged `[US2]`. A gap in phase three-a will say `FR-007 — no coverage`. That traceability is the whole mechanism.

---

## BEAT 4 — Phase 1a: Clarify (~75s)

**SAY:** Good specs surface ambiguity. Great tools surface it as questions you can answer before writing a line of code. Run clarify now.

**DO:**

```
/speckit-clarify
```

**SAY:** Up to five multiple-choice questions, one at a time, each with a recommended default. Things like: default list ordering — creation time or due date? ID format — UUID or integer? Timezone semantics for "overdue" — UTC only, or respect a client timezone header? These feel minor. They are not. List ordering is a breaking API change after launch. Timezone semantics is a bug report at 11pm on December 31st. The recommended default is usually the strictest, most correct reading. Accepting it is a valid strategy. What matters is that you made an explicit decision, and it is now in the spec. Not in your head.

---

## BEAT 5 — Phase 2: Plan (~90s)

**SAY:** We have a spec. Now we tell the agent the tech direction and let it design the system. We are steering, not guessing.

**DO:**

```
/speckit-plan Use Node.js 20 with TypeScript, Express for HTTP, and Zod for
input validation. Persist tasks to a single JSON file with an atomic write
(write to a temp file, fsync, rename) so a crash mid-write cannot corrupt
the store. Colocate tests next to source using Vitest. No database, no ORM,
no auth middleware.
```

**SAY:** Watch for two things. First, it will auto-create a feature branch — `001-tasks-api`. Second, you will see `Constitution Check = PASS` before the design is written, and again after. It is not rubber-stamping — if the draft design invents a dependency that violates principle four or five, it flags and revises before continuing. What lands in `specs/001-tasks-api/`: `plan.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, and a `quickstart.md`. Five artifacts. If you see a dependency in `plan.md` that you did not ask for — an ORM, a logging framework, something exotic — stop it now.

**DO (if needed):**

```
/speckit-plan remove <dep> — use fs/promises and a rename-based atomic write directly
```

**SAY:** That is the checkpoint. You own it.

---

## BEAT 6 — Phase 3: Tasks (~75s)

**SAY:** We have a spec, a plan, and a data model. Now we decompose. This is the step most people skip when prompting directly — they jump from description to implementation. Watch the difference.

**DO:**

```
/speckit-tasks
```

**SAY:** Thirty-plus tasks in `tasks.md`, across seven phases. Each tagged `[USn]` — which user story it serves. Each with a `[P]` marker if it can run in parallel with the previous. And — because the constitution said "tests before implementation, non-negotiable" — test tasks are interleaved automatically. Every implementation task is preceded by a failing test task. Not as a suggestion. The constitution upgraded it to required. Apply the filter to each task: if I finish only this task and commit, does the repo still build? If the answer is ever no, the task is too coarse. Split it.

---

## BEAT 7 — Phase 3a: Analyze (~90s)

**SAY:** This is the highest-leverage step in the entire pipeline. Most people skip it because it feels like overhead. Do not skip it.

**DO:**

```
/speckit-analyze
```

**SAY:** A cross-artifact consistency check — spec against plan against data model against tasks, all at once. You get two tables. First: a findings table with severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and the exact artifact conflict. Second: a coverage table — every FR and SC number mapped to the task IDs that implement it. On this API you will typically see about 92% coverage first pass. Maybe one HIGH — a functional requirement with zero tasks. Three MEDIUM — success criteria that have tasks but no test task. Two LOW — naming inconsistencies between the spec and the OpenAPI contract. Those are not style issues. That HIGH finding is a production bug. It is a requirement that was never implemented. You found it before writing a line of application code. Reply to the offer:

**DO:**

```
yes
```

**SAY:** The agent remediates — adds the missing tasks, cross-links the coverage gaps, aligns naming. Coverage goes to 100%. Now you have something you can actually build to.

---

## BEAT 8 — Phase 4: Implement (~90s)

**SAY:** The spec is locked. The plan is locked. The tasks are ordered and covered. Now we build.

**DO:**

```
/speckit-implement
```

**SAY:** The agent works phase by phase. Between phases it runs `tsc --noEmit` and `npx vitest run` as its own feedback loop — not because we told it to, but because the constitution said TypeScript strict and tests before implementation, and it is enforcing its own compliance. You will see the test counts climb — 21 of 21, then 36 of 36, phase by phase up to 75 or more. If a test fails mid-run, do not let it chase the fix blindly. Ask it: which line in the spec or plan does this failure trace to? Patch the spec first. Then re-run. The spec is the source of truth — not the test output, not the stack trace.

When it finishes, you will see a per-principle compliance table. Not "I think I followed the constitution." A table. Each principle, pass or fail. That is what enforcement looks like.

---

## BEAT 9 — Verify from a Fresh Shell (~30s)

**SAY:** One last thing. Do not trust the agent's own test report. Trust the code.

**DO:**

Exit Claude Code. Open a new terminal.

```bash
cd tasks-api && npm install && npm test
```

**SAY:** Same test count Claude reported. Green. No Claude in the loop — just Node, Vitest, and the implementation. That is the bar.

---

## PRESENTER NOTE — Version Drift

If anyone is following an older blog post from around September 2025, they may see commands like `/specify`, `/plan`, `/tasks`, `/implement` and an `--ai` flag on `init`. Those were the pre-stable names. Current Spec Kit (v0.12.x) uses the `speckit-` prefix on all commands and `--integration claude` instead of `--ai`. If you get a "command not found" error or a flag error on init, that is the reason. Use the commands in this script.

---

## CLOSER

**SAY:** Look at what you did not do. You did not write a route. You did not design a schema. You did not pick an atomic write strategy or decide how to represent "overdue." You did not write a test. You wrote the intent — and you made it executable. The spec is the source of truth. The code is a build artifact of the spec. The agent is fast. You are the one who knows what the right thing is. Spec-Driven Development keeps that power where it belongs — with you — and stops the guessing before the first line of code exists.

---

_Reference card — command sequence:_

| Phase | Command                 | Output                                                                               |
| ----- | ----------------------- | ------------------------------------------------------------------------------------ |
| 0     | `/speckit-constitution` | `.specify/memory/constitution.md`                                                    |
| 1     | `/speckit-specify`      | `specs/001-tasks-api/spec.md`                                                        |
| 1a    | `/speckit-clarify`      | Decisions folded into spec                                                           |
| 2     | `/speckit-plan`         | `plan.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md` |
| 3     | `/speckit-tasks`        | `tasks.md` (30+ tasks, `[P]`, `[USn]`)                                               |
| 3a    | `/speckit-analyze`      | Findings + coverage tables, auto-remediate                                           |
| 4     | `/speckit-implement`    | Full implementation, `tsc` + Vitest green                                            |
