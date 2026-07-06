import "dotenv/config";
import process, { argv, env, exit } from "node:process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { Claude } from "./core/claude.js";
import { MCPClient } from "./mcpClient.js";
import { CliChat } from "./core/cliChat.js";
import { CliApp } from "./core/cli.js";

function requireEnv(name: string): string {
  const value = env[name] ?? "";
  if (!value) {
    console.error(`Error: ${name} cannot be empty. Update .env`);
    exit(1);
  }
  return value;
}

async function main(): Promise<void> {
  const claudeModel = requireEnv("CLAUDE_MODEL");
  requireEnv("ANTHROPIC_API_KEY");

  const claudeService = new Claude(claudeModel);

  // Resolve the bundled DocumentMCP server relative to this entry file so it
  // works whether running compiled (dist/main.js -> dist/mcpServer.js, run with
  // plain node) or via tsx (src/main.ts -> src/mcpServer.ts, run with the tsx
  // loader). We match the child's extension + runner to how *this* file is
  // running: if the entry is a .ts file, we're under tsx.
  const here = dirname(fileURLToPath(import.meta.url));
  const runningFromSource = import.meta.url.endsWith(".ts");
  const serverScript = join(here, runningFromSource ? "mcpServer.ts" : "mcpServer.js");

  // A .ts server must be launched through the tsx loader; a compiled .js server
  // runs on plain node. `spawnArgsFor` builds the right command for either.
  const spawnArgsFor = (script: string) =>
    script.endsWith(".ts")
      ? { command: process.execPath, args: ["--import", "tsx", script] }
      : { command: process.execPath, args: [script] };

  const serverScripts = argv.slice(2);
  const clients: Record<string, MCPClient> = {};

  const docClient = new MCPClient(spawnArgsFor(serverScript));
  await docClient.connect();
  clients["doc_client"] = docClient;

  for (let i = 0; i < serverScripts.length; i++) {
    const script = serverScripts[i];
    const client = new MCPClient(spawnArgsFor(script));
    await client.connect();
    clients[`client_${i}_${script}`] = client;
  }

  try {
    const chat = new CliChat(docClient, clients, claudeService);
    const cli = new CliApp(chat);
    await cli.initialize();
    await cli.run();
  } finally {
    for (const client of Object.values(clients)) {
      await client.cleanup();
    }
  }
}

main().catch((error) => {
  console.error(error);
  exit(1);
});
