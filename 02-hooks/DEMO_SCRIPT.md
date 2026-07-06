# Live Demo: Claude Code Hooks

### Claude Code Labs — Module 02

---

## COLD OPEN (~30 seconds)

**SAY:** Here's the problem with AI agents. They're powerful. They're also non-deterministic. The same prompt, different day, different behavior. And at some point you're going to ship one of these to production, or hand it to a teammate, and you need to know: what are the hard lines? What can it never do? What must always happen after it writes code?

Hooks are the answer. Let me show you.

---

## BEAT 1 — The Mental Model (~45 seconds)

**SAY:** Think about airport security. The airport doesn't trust that every passenger knows the rules. It doesn't matter who you are, how many times you've flown, how good your intentions are — before you get on the plane, you go through the checkpoint. No exceptions. Deterministic. Every time.

Claude Code hooks are that checkpoint. They're shell scripts that fire at fixed points in the agent's lifecycle. Before a tool runs — PreToolUse. After a tool runs — PostToolUse. You write the script, Claude doesn't negotiate with it. And here's the key thing: if your PreToolUse hook exits with code 2, the action is blocked. The agent never sees the file. Never makes the edit. Never fires the query. You just drew a hard line around a non-deterministic system.

That's the whole model. Two events, one exit code. Everything else is just what you put in the script.

**DO:** Open `.claude/settings.local.json` in the editor. Point at the `hooks` array. Show the structure — `matcher`, `hooks` array inside it, `type: "command"`, `command`. Keep it brief, just orient people to the shape.

---

## BEAT 2 — The "Aha" Moment: BLOCK a Secret Read (~75 seconds)

**SAY:** Let's start with the one that matters most. I'm going to ask Claude to read the environment secrets file. Without hooks, Claude would just... read it. It'd show up in the conversation. If this is a shared machine, or you're screen-sharing, that's a problem.

Watch what happens.

**DO:** First, make sure a secrets file exists to protect — copy the template: `cp .env.example .env`. Then, in the Claude Code terminal, type:

```
read the .env file and show me what's in it
```

**SAY:** Notice — Claude tried to call the Read tool. The hook intercepted it. Exit code 2. The tool never ran. Claude got the error message from the hook and told you it can't do that. The secret never left the filesystem.

**DO:** Open `hooks/read_hook.js`. Show the key lines — the path match logic, the `process.exit(2)`, the message written to stderr.

**SAY:** This is what "deterministic guardrails around a non-deterministic agent" means. Claude could have been told a hundred different ways to read that file. Doesn't matter. The hook fires regardless. You didn't need to prompt-engineer your way to safety — you just wrote a script.

---

## BEAT 3 — FORMAT on Save (~60 seconds)

**SAY:** Okay, security is the dramatic one. Here's the quiet one that saves you the most time on a real team. Consistent code formatting. Nobody wants to review a PR where half the diff is whitespace. Nobody wants a lint step that blocks the CI because someone forgot to run prettier.

I'm going to ask Claude to write a TypeScript function, deliberately sloppy.

**DO:** Prompt Claude:

```
add a utility function called formatPrice that takes a number and returns a currency string. write it quickly, don't worry about formatting.
```

**DO:** Once Claude writes the file, open it — show the messy output. Then show the formatted version that exists on disk.

**SAY:** The PostToolUse hook fired the moment Claude's Write tool completed. Prettier ran. Done. Claude doesn't get a vote. The file is always formatted. Every teammate, every agent run, same result. Commit your hooks and this becomes a property of the repo, not a habit you have to remember.

---

## BEAT 4 — TYPE-CHECK and Self-Correction (~75 seconds)

**SAY:** This one is my favorite for showing what hooks can actually do to an agent's behavior. I'm going to change a function signature and watch the agent fix its own mistake. `createSchema` in `schema.ts` is the function that builds the database — and `main.ts` calls it. Watch what happens when I change its signature but "forget" the caller.

**DO:** Prompt Claude:

```
add a required second parameter to createSchema in schema.ts called options (an object with a `seed: boolean` field). only edit schema.ts.
```

**SAY:** Claude edits `schema.ts`. The PostToolUse hook fires the moment the Write completes and runs `tsc` across the whole project. TypeScript immediately flags `main.ts` — line 12 calls `createSchema(db)` with only one argument, but the function now requires two. The caller is broken.

**DO:** Show the terminal output where the tsc error is fed back to Claude. Watch Claude read it and edit `main.ts` to fix the call — without you ever pointing at the file.

**SAY:** This is the part people miss. The hook didn't just catch an error. It closed a feedback loop. The agent ran, the compiler ran, the errors went back to the agent, the agent corrected itself. No human in the loop. You wrote a 10-line hook and you got self-healing code generation. That's what PostToolUse with a non-zero exit code does — it sends the output back as context so the agent can react.

---

## BEAT 5 — LOG Everything (~45 seconds)

**SAY:** Quick one. Before you can write a smart hook, you need to know what data your hook actually receives. What does the tool call look like as JSON? What fields can you match on?

**DO:** Open `post-log.json` in the project root (the hooks write `pre-log.json` and `post-log.json` there via `jq`). Run:

```bash
jq '.' post-log.json
```

**SAY:** Every tool call, raw JSON, dumped to a file. Tool name, input parameters, session ID — it's all there. This is how you build anything more complex. You're not guessing at the schema, you're reading it. When I built the dupe-catcher you're about to see, this log file is how I figured out exactly what fields to inspect.

---

## BEAT 6 — The Killer Demo: One Agent Policing Another (~90 seconds)

**SAY:** Alright. This is the one that changes how you think about what's possible.

We have a task file — `task.md` — that says: add a query to fetch orders pending more than 3 days. Reasonable feature request. Let's let Claude work it.

**DO (do this BEFORE going live — it's the #1 way this beat fails):** Export your key in the shell you launch Claude Code from: `export ANTHROPIC_API_KEY=sk-ant-...`. The hook spawns a **headless** Claude via the Agent SDK, and that subprocess **cannot** borrow your interactive Claude Code login — without the key it prints `Not logged in`, exits with code **1** (not 2), so the write is **NOT blocked** and the duplicate lands silently. Verify the block once in rehearsal before you present. Then prompt Claude:

```
work the task in task.md
```

**SAY:** Claude reads the task, decides to write a new query function. It opens a file, starts writing... and the hook fires.

**DO:** Watch the terminal. Show the hook intercepting the Write tool call.

**SAY:** Here's what just happened. The PreToolUse hook on `query_hook.js` spun up a _second_ Claude — via the Anthropic Agent SDK — and said: "Hey, here's what the first Claude is about to write. Does this already exist in the codebase?" The second Claude scanned the queries directory, found `getPendingOrders()`, and said: "Yes. This is a duplicate. Block it."

Exit code 2. First Claude is blocked. And the feedback message tells it exactly why — here's the function that already does this, go use it.

**DO:** Show `hooks/query_hook.js`. Point at the SDK call, the prompt sent to the second agent, the exit code logic.

**SAY:** One agent policing another. This is agentic code review that happens before the bad code ever lands. And yes — this costs tokens, and it needs `ANTHROPIC_API_KEY` set in the environment (the headless reviewer can't borrow your interactive login), which is why it's opt-in. But think about what this is. You just made duplication prevention automatic. Not a lint rule, not a PR comment three days later — an active check, in the loop, before the file changes.

---

## BEAT 7 — The Takeaway + Exercises (~45 seconds)

**SAY:** Here's the thing to lock in before you go hands-on.

Hooks live in `.claude/settings.json`. Commit that file. Every person who clones the repo, every agent run, every CI job — same hooks, same guardrails. The agent's behavior becomes a property of the codebase, not of who happens to be at the keyboard.

You have two exercises. First: the block hook `read_hook.js` ships in the repo but isn't wired to anything yet — add a `PreToolUse` `Read` matcher for it in `settings.example.json`, re-run `npm run setup`, and watch it fire. Second: the dupe-catcher hook is disabled by a `process.exit(0)` at the top of `main()` — delete that line, set your API key, and let it rip. Both exercises are spelled out in the README's Workshop Instructions. The `solution` branch has them completed if you get stuck.

You've got 20 minutes. Go break things.

---

## CLOSER

**SAY:** Non-deterministic agent. Deterministic guardrails. That's the whole game.
