#!/bin/bash
# PostToolUse hook: auto-format files after Claude edits them
# The tool result comes in via stdin as JSON

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"filePath":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

EXT="${FILE_PATH##*.}"

case "$EXT" in
  ts|tsx|js|jsx|json|css|md)
    npx prettier --write "$FILE_PATH" 2>/dev/null
    echo "✅ Auto-formatted: $FILE_PATH" >&2
    ;;
  py)
    python3 -m black "$FILE_PATH" 2>/dev/null
    echo "✅ Auto-formatted: $FILE_PATH" >&2
    ;;
  *)
    echo "⏭️  Skipped formatting: $FILE_PATH (no formatter for .$EXT)" >&2
    ;;
esac

exit 0