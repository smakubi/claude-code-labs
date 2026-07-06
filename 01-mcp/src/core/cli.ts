import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type { Prompt } from "@modelcontextprotocol/sdk/types.js";
import type { CliChat } from "./cliChat.js";

interface NamedPrompt {
  name: string;
}

/**
 * Pure completion logic shared by the readline completer. Returns the list of
 * candidate completions for the current input line. Mirrors the three cases the
 * Python prompt-toolkit completer handled: @resource, /command, and
 * /command <arg> (argument = resource id).
 */
export function buildCompletions(
  line: string,
  prompts: NamedPrompt[],
  resources: string[]
): string[] {
  // @-mention: complete the token after the last "@".
  const atIndex = line.lastIndexOf("@");
  if (atIndex !== -1) {
    const prefix = line.slice(atIndex + 1);
    return resources.filter((id) =>
      id.toLowerCase().startsWith(prefix.toLowerCase())
    );
  }

  if (line.startsWith("/")) {
    const parts = line.slice(1).split(/\s+/);

    // "/cmd" (no trailing space, single token) → complete command names.
    if (parts.length <= 1 && !line.endsWith(" ")) {
      const cmdPrefix = parts[0] ?? "";
      return prompts
        .map((p) => p.name)
        .filter((name) => name.startsWith(cmdPrefix));
    }

    // "/cmd <argPrefix>" → complete the argument from resource ids.
    if (parts.length >= 2) {
      const docPrefix = parts[parts.length - 1];
      return resources.filter((id) =>
        id.toLowerCase().startsWith(docPrefix.toLowerCase())
      );
    }
  }

  return [];
}

/**
 * The substring of `line` that the completions returned by buildCompletions are
 * meant to replace. Node's readline uses this as its `completeOn` value: it
 * appends the diff between the completions' common prefix and this token. It
 * must therefore be the *token* being completed (the text after "@", or the
 * command / argument word) — not the whole line — otherwise readline mangles or
 * drops the inserted completion. Kept in lockstep with the cases above.
 */
export function completionToken(line: string): string {
  const atIndex = line.lastIndexOf("@");
  if (atIndex !== -1) {
    return line.slice(atIndex + 1);
  }

  if (line.startsWith("/")) {
    const parts = line.slice(1).split(/\s+/);

    if (parts.length <= 1 && !line.endsWith(" ")) {
      return parts[0] ?? "";
    }

    if (parts.length >= 2) {
      return parts[parts.length - 1];
    }
  }

  return line;
}

export class CliApp {
  private readonly agent: CliChat;
  private resources: string[] = [];
  private prompts: Prompt[] = [];

  constructor(agent: CliChat) {
    this.agent = agent;
  }

  async initialize(): Promise<void> {
    await this.refreshResources();
    await this.refreshPrompts();
  }

  private async refreshResources(): Promise<void> {
    try {
      this.resources = await this.agent.listDocIds();
    } catch (error) {
      console.error(`Error refreshing resources: ${String(error)}`);
    }
  }

  private async refreshPrompts(): Promise<void> {
    try {
      this.prompts = await this.agent.listPrompts();
    } catch (error) {
      console.error(`Error refreshing prompts: ${String(error)}`);
    }
  }

  private completer(line: string): [string[], string] {
    const completions = buildCompletions(line, this.prompts, this.resources);
    return [completions, completionToken(line)];
  }

  async run(): Promise<void> {
    const rl = readline.createInterface({
      input: stdin,
      output: stdout,
      completer: (line: string) => this.completer(line),
    });

    // Ctrl-C closes the REPL (parity with the Python KeyboardInterrupt break).
    rl.on("SIGINT", () => rl.close());

    // readline's question() promise does not settle when the input stream
    // closes (EOF / Ctrl-D), so race it against the "close" event to exit
    // cleanly instead of hanging.
    const ask = (prompt: string): Promise<string | null> =>
      new Promise((resolve) => {
        const onClose = () => resolve(null);
        rl.once("close", onClose);
        rl.question(prompt).then(
          (answer) => {
            rl.removeListener("close", onClose);
            resolve(answer);
          },
          () => {
            rl.removeListener("close", onClose);
            resolve(null);
          }
        );
      });

    try {
      for (;;) {
        const userInput = await ask("> ");
        if (userInput === null) {
          // EOF (Ctrl-D) or Ctrl-C — exit the REPL.
          break;
        }

        if (userInput.trim() === "") {
          continue;
        }

        const response = await this.agent.run(userInput);
        console.log(`\nResponse:\n${response}`);
      }
    } finally {
      rl.close();
    }
  }
}
