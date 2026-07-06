# Live Demo: Model Context Protocol (MCP)

### Claude Code Labs — Module 01

---

## COLD OPEN (~30 seconds)

**SAY:** You have one of the most powerful language models in the world. It knows everything in its training data. It can reason, write, summarize, plan. And it cannot see a single file on your laptop. It cannot call your API. It cannot read your database. It is a genius locked in a soundproof room, and you are passing notes under the door.

That is the problem MCP solves. And in the next six minutes, you will see exactly how.

---

## BEAT 1 — The Sealed Box and the Universal Port (~60s)

**SAY:** Here is the mental model. An LLM, by itself, is sealed. It has knowledge but no reach. To give it reach, you have to plug things in.

MCP — the Model Context Protocol — is the standard for how you do that. Think USB-C. Before USB-C, every device had its own plug. After USB-C, one port works everywhere. MCP is that for AI. One protocol, and any compliant tool just plugs in.

And it shifts the burden off you. Say you want Claude to work with GitHub. Without MCP, you hand-write and maintain a tool schema and a function for every operation — `get_repos`, `list_repos`, `create_issue`, `search_issues`, on and on. That is all your code to test and own, forever. With MCP, GitHub's own MCP server exposes all of it as standardized tools. You do not write them. You connect. The work moves off your plate and onto the specialized server.

When you connect an MCP server to a model, it can expose three things. **Tools** — functions the model can call, like reading a file or writing to a database. **Resources** — data addressable by a URI, like a document, a row, a report — the model can pull those in as context. And **Prompts** — reusable instruction templates that users trigger with slash commands.

This app — `mcp-chat-cli` — is an MCP **client**. It is a terminal chat REPL. When it starts, it launches a bundled MCP server called DocumentMCP as a child process and wires its tools directly into the conversation.

Let me show you.

**DO:**

```bash
npm run dev
```

> Wait for the `>` prompt to appear. The startup log will show the MCP server connecting.

---

## BEAT 2 — Plain Chat Baseline (~45s)

**SAY:** Before we plug anything in, let me show you the floor. This is just chat. Claude, no tools, no documents. Exactly what you get at claude.ai.

**DO:**

```
> What is the Model Context Protocol in one sentence?
```

**SAY:** It answers from training data. No server involved. That is your baseline. Now watch what happens when we give it a reach into the real world.

---

## BEAT 3 — Resource Injection With `@mention` (~75s)

**SAY:** The first way to get data into the model is resource injection. You pull a document directly into the prompt before the model even runs. The app does the fetching — not the model.

Watch. I type `@` and press Tab.

**DO:**

```
> @[TAB]
```

> Tab-complete will show the full document list: `deposition.md`, `report.pdf`, `financials.docx`, `outlook.pdf`, `plan.md`, `spec.txt`. Pause and let the audience read them.

**SAY:** These are the documents the DocumentMCP server knows about. Real IDs, Tab-completes. Pick any two.

**DO:**

```
> Summarize @report.pdf and @plan.md together
```

**SAY:** No tool call happened there. The model did not reach out and fetch anything. The app saw those `@mentions`, went to the server, grabbed the text, and embedded it in the prompt as context — before Claude ever saw the message. That is a Resource. The data arrived in the model's input window, not through a function call. Fast, simple, model-oblivious.

That is one path. Here is the other.

---

## BEAT 4 — Server-Defined Prompts With `/command` (~60s)

**SAY:** Now let me show you Prompts. I type `/` and press Tab.

**DO:**

```
> /[TAB]
```

> Tab-complete shows `/format`.

**SAY:** There is one prompt: `/format`. This is not a command baked into the app. It lives on the _server_. The server defines it, the client discovers it at startup, and Tab-completion just exposes it. When you fire it, the server sends back a fully templated instruction that tells Claude to reformat the document using the edit tool.

**DO:**

```
> /format spec.txt
```

**SAY:** Watch what just happened. The `/format` prompt returned a template that instructed the model to rewrite `spec.txt` using `edit_document`. So now we are about to enter tool territory. The model is not just answering — it is about to act.

---

## BEAT 5 — The Agent Loop: Model-Driven Tools (~90s)

**SAY:** This is the heart of it. Forget `@mentions` for a second. I am going to give Claude a task and not tell it how to do it.

**DO:**

```
> Change the word "budget" to "forecast" in financials.docx, then show me the result
```

**SAY:** I did not `@mention` the file. I did not name a tool. I just said what I wanted.

Watch the output. The model decided — on its own — to call `edit_document` on `financials.docx`. The app executed that against the MCP server. The server returned the updated document. The model read the result. And then it called `read_doc_contents` to confirm the change. Then it answered me.

That loop — model decides, app calls the tool, result feeds back, model continues — that is the **agent loop**. Model → tool → result → model. It runs until the model has what it needs to answer.

Under the hood it is just two MCP message pairs: `ListTools` to discover what a server offers (the app does this once at startup) and `CallTool` to run one and get the result back. That is the entire protocol surface for tools — everything else is your application logic.

This is fundamentally different from resource injection. With `@mention`, you decide what context the model gets. With tools, the model decides. It is an agent making calls, not a chatbot receiving input.

And that distinction — you pushing context in versus the model pulling what it needs — that is the design choice you make every time you build on MCP.

> **Presenter note:** Run this live without pre-staging the file. The model should find and edit it from scratch — that is the point. If it hallucinates a file path, it is actually a great teaching moment: tools can fail, and the loop handles it.

---

## BEAT 6 — Extensibility: The Real Payoff (~60s)

**SAY:** So far we have had one MCP server — DocumentMCP. But here is why this whole thing matters.

Any MCP-compliant server you pass on the command line launches as its own process and its tools merge into the same conversation. No code changes. No redeployment. Just plug it in.

**DO:**

```bash
npm run dev -- ./path/to/another-server.js
```

**SAY:** The startup log will show a second server connecting. Its tools appear alongside DocumentMCP's. Claude can now call all of them, in the same agent loop, in the same chat.

That is the USB-C moment. You do not rebuild the host. You do not patch the model. You just attach a new server, and the model's capabilities expand instantly.

Your Stripe integration, your internal knowledge base, your Jira tickets, your Databricks catalog — anyone who builds a compliant MCP server makes Claude more capable for every client that speaks the protocol. One standard. Any tool. That is the whole bet.

---

## CLOSER

**SAY:** The model did not get smarter tonight. You gave it ports.

MCP is how a brain in a box reaches your world — one protocol, any tool, zero rewiring.

---

> **Before you present:** Run `npm run dev`, press Tab after `@` and `/` to confirm the real document IDs and commands load correctly. Exit the REPL with **Ctrl-D**.
>
> **Bonus, if someone asks "how do you build and test a server like this?":** run `npm run inspect` to open the **MCP Inspector** — a browser UI (usually `http://127.0.0.1:6274`) that lists a server's tools, resources, and prompts and lets you run each one by hand, no app required. It's the dev-loop tool for building MCP servers. Not needed for this demo, but a strong follow-up.
