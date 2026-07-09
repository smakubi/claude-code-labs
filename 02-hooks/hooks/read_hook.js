async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

  // For Read-style tools this is the target path; for Bash it's the shell
  // command. Either one is enough to catch an attempt to reach the .env file.
  const readPath =
    toolArgs.tool_input?.file_path || toolArgs.tool_input?.path || "";
  const command = toolArgs.tool_input?.command || "";

  // Non-secret dotenv variants that are safe to read (templates, docs).
  const SAFE_SUFFIXES = ["example", "sample", "template", "dist", "md"];

  // A token is a protected file iff the *whole* token is a `.env` path:
  // `.env`, `.env.local`, `dir/.env`, etc. — but not a safe variant, not a
  // substring (`environment.ts`), and not multi-word prose (a quoted commit
  // message tokenizes as one space-containing token, which can't match).
  const FILE_RE = /^(?:.*\/)?\.env(?:\.([\w-]+))?$/;

  // Split a shell command into tokens, keeping quoted spans intact so a
  // `-m "Block .env reads"` message stays a single (non-filename) token.
  const tokenize = (str) => {
    const tokens = [];
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let m;
    while ((m = re.exec(str)) !== null) {
      tokens.push(m[1] ?? m[2] ?? m[3]);
    }
    return tokens;
  };

  const isProtected = (token) => {
    const m = FILE_RE.exec(token);
    return m !== null && !SAFE_SUFFIXES.includes(m[1]);
  };

  // readPath is a single literal path; the command needs tokenizing.
  const tokens = [readPath, ...tokenize(command)];
  if (tokens.some(isProtected)) {
    console.error("You cannot read the .env file");
    process.exit(2);
  }
}

main();
