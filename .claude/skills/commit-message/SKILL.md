---
name: commit-message
description: Suggest a one-line Conventional Commits message for the current changes in greyhoarder. Use whenever the user asks for a commit message ("commit msg", "commit nachricht", "commit message").
---

# Commit message

Suggest the subject line only: no body, no bullet points.

1. Find the changes: `git diff --cached --stat` if something is staged,
   otherwise `git status --short` and `git diff --stat`. Read the diffs
   only as far as needed to understand what changed.
2. Write one line in Conventional Commits form:
   `<type>(<scope>): <description>`
   - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
   - Scope only when one workspace is affected: `client`, `server`,
     `domain`, `protocol`, `e2e`. Docs and repo-wide changes have no scope.
   - Lower case, imperative mood ("add", not "added"), no period at the
     end, at most 72 characters.
   - Describe what the change achieves, not the files it touches.
3. Answer with the line in a code block and nothing else. Only if the
   changes clearly belong to separate commits, give one line per commit
   and name the files or folders for each in a few words.

Never stage, commit or push.
