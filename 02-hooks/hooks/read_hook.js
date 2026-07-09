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

  // Ensure Claude isn't trying to read the .env file, whether directly via a
  // Read tool or indirectly through a shell command (cat/grep/etc.).
  if (readPath.includes(".env") || command.includes(".env")) {
    console.error("You cannot read the .env file");
    process.exit(2);
  }
}

main();
