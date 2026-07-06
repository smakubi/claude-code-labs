# Live Demo: Plan Mode

### Claude Code Labs — Module 03

---

## COLD OPEN (~30 seconds)

**SAY:** Here is the situation most people are in. You paste a task into your coding agent, it runs, you review the diff. That works. Until it doesn't.

The moment a task touches more than one file — more than one architectural decision — you are not dealing with one error rate. You are dealing with compounding error rates. Twenty decisions at 80% accuracy each. Do the math: your odds of a fully-correct result are about 1%.

Plan Mode fixes the math. And I'm going to show you exactly how.

---

## BEAT 1 — The Baseline (~45s)

**SAY:** We are working with a sample Express project. One file, about 90 lines. `src/api/orders.ts`. Let's look at it.

**DO:**

```
open 03-plan-mode/demo/sample-project/src/api/orders.ts
```

**SAY:** HTTP parsing. Validation. Database access. Response formatting. Logging. All in one function. You've seen this. Maybe you've written this.

I could just tell Claude "clean this up." But this is exactly the shape of task where compounding decisions bite. How many layers? Where do the files live? What gets exported? Does the service own the DTO or does the route?

Each one of those is a decision. Each one has an error rate. They stack.

First — let's confirm we have a green baseline. Plan Mode is worthless on a red baseline.

**DO:**

```bash
cd 03-plan-mode/demo/sample-project && npm install && npm test
```

**SAY:** Two tests, both passing. That's our floor. Now let's get into it.

---

## BEAT 2 — Entering Plan Mode (~30s)

**SAY:** Launch Claude Code.

**DO:**

```bash
claude
```

**SAY:** Now — Shift+Tab, twice. Watch the footer.

**DO:**

```
[Press Shift+Tab twice — footer should read: plan mode on]
```

**SAY:** That's it. Three modes cycle: Normal, Auto-Accept, Plan. We're in Plan Mode now. What does that actually mean?

In this mode, the agent will read your code, explore the codebase, ask you questions. It will NOT edit a file. It will NOT run a shell command. It refuses. That is the guarantee. The only thing it can produce right now is a plan.

If Shift+Tab gets swallowed by your terminal — some do that — type `/plan` instead. Same result.

---

## BEAT 3 — The Explore Phase (~75s)

**SAY:** Now I give it the task. Notice what I'm asking for at the end.

**DO:** Paste this prompt:

```
Refactor src/api/orders.ts into three layers: an Express route that only
handles HTTP, a service that owns business logic, and a repository that
owns database access. Read src/api/orders.ts, src/db/client.ts, and the
existing tests before proposing anything. Ask me any questions you need
answered before you write the plan.
```

**SAY:** Watch what happens. It delegates to its Explore subagent — read-only, grep, glob — and comes back with questions. Not a plan. Questions.

That line at the end — "ask me any questions you need answered before you write the plan" — is load-bearing. Without it, some agents will skip straight to a plan. If that happens, re-prompt:

**DO:** (show in comments, do not paste yet)

```
Before proposing a plan, list every file you read and one question about each.
```

**SAY:** It's going to ask me three to five things. Where does the repository file live? Class or module functions? Who owns the data types — does the route get the raw DB row or a clean DTO?

**DO:** Answer the clarifying questions:

```
Repository: src/db/repositories/orders.ts
Use module functions — not a class
Introduce a DTO: the API layer should never see the raw DB row
```

**SAY:** Those answers just made twenty implicit decisions explicit. They're locked in now — before a single line of code is written.

---

## BEAT 4 — Reading and Editing the Plan (~90s)

**SAY:** Now it produces the plan. Read it with me. Here is what I am looking for.

Are the tests interleaved — or are they all dumped at the end? Tests at the end means your suite goes red between steps, which is miserable to debug. TDD-style plans measurably outperform dump-at-the-end plans.

Does every file path already exist, or is it explicitly new? If I see a path I don't recognize and the plan doesn't say "create this," that's an invented path. Reject it.

Does any step say "I'll figure this out at implementation time" on something architectural? That is the phrase that buries you two hours later in a diff you can't explain.

And — scope drift. "While we're here, let's also clean up the auth middleware." No. Out of scope. Reject.

Now — one thing I know that the plan doesn't. The existing tests import from `src/api/orders.ts` directly. When we extract the repository, that import has to update in the same step — or the suite goes red between steps.

I'm going to annotate the plan.

**DO:**

```
[Press Ctrl+G]
```

**SAY:** This opens the plan file in your editor. If Ctrl+G does nothing, your `$EDITOR` variable is unset. Fix it:

**DO:** (show in comments)

```bash
export EDITOR="code --wait"
```

**SAY:** I'm adding a note to the repository extraction step.

**DO:** Add annotation in editor:

```
# NOTE: existing tests import from src/api/orders.ts — update test imports
# in THIS step, same commit, or the suite goes red between steps.
```

Save, close editor. Return to Claude.

**SAY:** It should acknowledge that annotation before it does anything. If it doesn't — prompt it:

**DO:** (show in comments)

```
Address all annotations in the plan before you start implementing.
```

**SAY:** The agent picks up every edit. That plan is now yours as much as it is the agent's.

---

## BEAT 5 — Execute (~60s)

**SAY:** Approve. Watch it go.

**DO:**

```
yes
```

**SAY:** It works step by step. Route first, then service, then repository, then the import updates. Narrate what you see:

Three things to watch for — what I call drift signals.

One: it edits a file that the current step doesn't name. Two: it silently resolves an architecture question the plan left open — "I decided to use a class after all." Three: it merges two steps into one without telling you.

Any of those: stop it. Shift+Tab back into Plan Mode.

**DO:** (if drift occurs)

```
[Shift+Tab to re-enter plan mode]

Re-plan the remaining steps. The work already done stands.
We need a revised plan for what's left.
```

**SAY:** Two or three plan revisions on a feature this size is completely normal. That is not failure — that is the process working.

---

## BEAT 6 — Verify Green (~45s)

**SAY:** Let it finish. Now we exit Claude Code and verify.

**DO:**

```bash
npm test
```

**SAY:** Green. Both tests pass.

**DO:**

```bash
npm run typecheck
```

**SAY:** Clean.

**DO:**

```bash
git diff --stat
```

**SAY:** Look at that diff. A new route file. A new service file. A new repository file. The original handler, slimmed down to almost nothing. Exactly what the plan said.

If tests had failed — do not ask the agent to fix it blindly. That's how you end up in a five-round patch loop. Re-enter Plan Mode. Trace the failure back to which step in the plan it corresponds to. The failure lives in the plan, or it lives in execution drift. Either way, the plan is where you diagnose it.

---

## CLOSER

**SAY:** Here is what just happened.

We had a 90-line mess, a task that required twenty-odd decisions, and a non-trivial refactor across four files. And the first thing we produced — before a single line of code was written — was a plan you could read in two minutes.

That annotation you added? That was a real mistake, caught at plan review. It would have surfaced two hours later as a mysteriously failing test suite, in a diff you had to reverse-engineer.

The plan was the artifact. The code came out of the plan. Any mistake would have been caught in the two minutes it took to read it — not the two hours it takes to review a diff.

That is Plan Mode. That is what it's for.

---

**REFERENCE CARD**

| Action                          | How                                                         |
| ------------------------------- | ----------------------------------------------------------- |
| Enter Plan Mode                 | Shift+Tab twice (footer: `plan mode on`)                    |
| Fallback if Shift+Tab swallowed | `/plan` command                                             |
| Persistent default              | `"permissions": {"defaultMode": "plan"}` in `settings.json` |
| CLI flag                        | `--permission-mode plan`                                    |
| Edit the plan                   | Ctrl+G or `/plan open` — opens in `$EDITOR`                 |
| Fix missing `$EDITOR`           | `export EDITOR="code --wait"`                               |
| On drift                        | Shift+Tab back to Plan Mode, re-plan remainder              |
| Version plans with repo         | `"plansDirectory": "./plans"` in `settings.json`            |
| Default plan location           | `~/.claude/plans/`                                          |

**PLAN REVIEW CHECKLIST**

- Tests interleaved (not dumped at end)
- Every file path exists or explicitly new
- No "I'll figure it out at implementation time" on anything architectural
- No scope drift ("while we're here" language)
- Import updates co-located with the extraction step that requires them
