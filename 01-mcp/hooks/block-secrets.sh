#!/bin/bash
# PreToolUse hook: block access to secrets and env files

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

if [ -z "$FILE_PATH" ]; then
  exit 0  # allow — no file path found
fi

BASENAME=$(basename "$FILE_PATH")

case "$BASENAME" in
  .env|.env.local|.env.production|*.pem|*.key|id_rsa*)
    echo "🚫 BLOCKED: $BASENAME is a sensitive file" >&2
    exit 2  # exit 2 = block the action
    ;;
esac

exit 0  # allow