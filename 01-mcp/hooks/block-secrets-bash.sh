#!/bin/bash
# PreToolUse hook (Bash): block shell commands that READ sensitive files.
#
# Complements block-secrets.sh (which covers the Read/Edit/Write tools). Those
# tools pass a "file_path"; Bash passes a "command" string, so we scan the
# command text instead.
#
# To reduce false positives we block only when BOTH are true:
#   1. a content-reading tool appears as a command word, AND
#   2. a sensitive file is referenced.
# This lets metadata commands through (git status, git check-ignore .env,
# ls -la .env) while still catching `cat .env`, `grep KEY .env`, `cp .env ...`.
#
# NOTE: command-text matching is best-effort defense-in-depth, not a guarantee.
# Obfuscation (c""at, base64 pipes, reading via a helper script) can slip past.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -oE '"command"[[:space:]]*:[[:space:]]*"([^"\\]|\\.)*"' | head -1 | sed -E 's/^"command"[[:space:]]*:[[:space:]]*"(.*)"$/\1/')

if [ -z "$COMMAND" ]; then
  exit 0  # allow — no command found
fi

# Tools that expose file contents (dump, page, edit, copy, encode, search).
READ_TOOLS='cat|tac|nl|less|more|head|tail|bat|view|nano|vi|vim|emacs|xxd|od|hexdump|strings|grep|egrep|fgrep|rg|ag|awk|sed|cut|dd|base64|cp|scp|rsync|pbcopy|open|code'

# Sensitive filename patterns (basenames / suffixes). Keep in sync with
# block-secrets.sh. .env.example is intentionally NOT matched.
SECRET_FILES='(^|[^a-zA-Z0-9._-])(\.env(\.local|\.production)?|id_rsa[a-zA-Z0-9._-]*)([^a-zA-Z0-9._-]|$)|\.(pem|key)([^a-zA-Z0-9._-]|$)'

# A read tool used as a command word: at start, or after a shell operator/space.
READ_TOOL_WORD="(^|[|;&(]|[[:space:]])($READ_TOOLS)([[:space:]]|\$)"

if echo "$COMMAND" | grep -qiE "$READ_TOOL_WORD" && echo "$COMMAND" | grep -qiE "$SECRET_FILES"; then
  echo "🚫 BLOCKED: command reads a sensitive file (.env / *.pem / *.key / id_rsa*)" >&2
  echo "   If this is intentional, run it yourself outside Claude." >&2
  exit 2  # exit 2 = block the action
fi

exit 0  # allow
