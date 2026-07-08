import type Anthropic from "@anthropic-ai/sdk";
import type { Prompt, PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import { Chat } from "./chat.js";
import { Claude } from "./claude.js";
import type { MCPClient } from "../mcpClient.js";

export class CliChat extends Chat {
  private readonly docClient: MCPClient;

  constructor(
    docClient: MCPClient,
    clients: Record<string, MCPClient>,
    claudeService: Claude
  ) {
    super(claudeService, clients);
    this.docClient = docClient;
  }

  async listPrompts(): Promise<Prompt[]> {
    return this.docClient.listPrompts();
  }

  async listDocIds(): Promise<string[]> {
    return (await this.docClient.readResource("docs://documents")) as string[];
  }

  async getDocContent(docId: string): Promise<string> {
    return (await this.docClient.readResource(
      `docs://documents/${docId}`
    )) as string;
  }

  async getPrompt(command: string, docId: string): Promise<PromptMessage[]> {
    return this.docClient.getPrompt(command, { doc_id: docId });
  }

  async extractResources(query: string): Promise<string> {
    const mentions = query
      .split(/\s+/)
      .filter((word) => word.startsWith("@"))
      .map((word) => word.slice(1))
      .filter((mention) => mention.length > 0);

    const docIds = await this.listDocIds();
    const seen = new Set<string>();
    const mentionedDocs: Array<[string, string]> = [];

    // Resolve each mention to a doc id (exact match, or an unambiguous prefix)
    // so partial mentions like "@pl" work even when the terminal doesn't deliver
    // Tab for completion. Ambiguous or unknown mentions are skipped.
    for (const mention of mentions) {
      const docId = resolveId(mention, docIds);
      if (docId !== undefined && !seen.has(docId)) {
        seen.add(docId);
        mentionedDocs.push([docId, await this.getDocContent(docId)]);
      }
    }

    return mentionedDocs
      .map(
        ([docId, content]) =>
          `\n<document id="${docId}">\n${content}\n</document>\n`
      )
      .join("");
  }

  async processCommand(query: string): Promise<boolean> {
    if (!query.startsWith("/")) {
      return false;
    }

    const words = query.split(/\s+/);
    const commandToken = words[0].replace("/", "");

    // Resolve the command name and the document argument by exact match or an
    // unambiguous prefix, so "/for sp" behaves like "/format spec.txt" even when
    // Tab completion is unavailable. Fall back to the raw token when nothing
    // resolves, letting the server surface a clear error.
    const promptNames = (await this.listPrompts()).map((p) => p.name);
    const command = resolveId(commandToken, promptNames) ?? commandToken;

    const argToken = words[1];
    let docId = argToken;
    if (argToken !== undefined) {
      const docIds = await this.listDocIds();
      docId = resolveId(argToken, docIds) ?? argToken;
    }

    const messages = await this.docClient.getPrompt(command, {
      doc_id: docId,
    });

    this.messages.push(...convertPromptMessagesToMessageParams(messages));
    return true;
  }

  protected override async processQuery(query: string): Promise<void> {
    if (await this.processCommand(query)) {
      return;
    }

    const addedResources = await this.extractResources(query);

    const prompt = `
        The user has a question:
        <query>
        ${query}
        </query>

        The following context may be useful in answering their question:
        <context>
        ${addedResources}
        </context>

        Note the user's query might contain references to documents like "@report.docx". The "@" is only
        included as a way of mentioning the doc. The actual name of the document would be "report.docx".
        If the document content is included in this prompt, you don't need to use an additional tool to read the document.
        Answer the user's question directly and concisely. Start with the exact information they need.
        Don't refer to or mention the provided context in any way - just use it to inform your answer.
        `;

    this.messages.push({ role: "user", content: prompt });
  }
}

/**
 * Resolve a user-typed token to a known id. An exact (case-sensitive) match
 * always wins; otherwise a *single* case-insensitive prefix match is accepted.
 * Returns undefined when nothing matches or when a prefix is ambiguous (matches
 * more than one id), so callers never silently pick the wrong document.
 *
 * This lets partial references like "@pl" or "/for sp" work even in terminals
 * that don't deliver Tab as a keypress for readline completion.
 */
export function resolveId(token: string, ids: string[]): string | undefined {
  if (ids.includes(token)) {
    return token;
  }

  const lower = token.toLowerCase();
  const matches = ids.filter((id) => id.toLowerCase().startsWith(lower));
  return matches.length === 1 ? matches[0] : undefined;
}

export function convertPromptMessageToMessageParam(
  promptMessage: PromptMessage
): Anthropic.MessageParam {
  const role = promptMessage.role === "user" ? "user" : "assistant";
  const content = promptMessage.content;

  if (content.type === "text") {
    return { role, content: content.text };
  }

  return { role, content: "" };
}

function convertPromptMessagesToMessageParams(
  promptMessages: PromptMessage[]
): Anthropic.MessageParam[] {
  return promptMessages.map(convertPromptMessageToMessageParam);
}
