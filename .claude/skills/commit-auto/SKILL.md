---
name: commit-auto
description: Stage and commit the current changes in greyhoarder with Conventional Commits messages, after showing an overview and getting the user's confirmation. Use when the user asks to commit their changes ("commit-auto", "committe das", "commit the changes").
---

# Commit auto

Commit the working tree changes, but only after the user has confirmed an
overview. Never commit without that confirmation, and never push.

1. Read `.claude/skills/commit-message/SKILL.md`. Its rules decide the
   message, the type, the scope and when changes belong in separate
   commits. Its "never stage, commit or push" applies to that skill only;
   here staging and committing are allowed after step 5.
2. Collect the changes: `git status --short` and `git diff --stat HEAD`,
   plus untracked files. Read the diffs only as far as needed for the
   message. If nothing changed, say so and stop.
3. Leave out files that must never be committed and name them in the
   overview: `.env` and `.env.*` (except `.env.example`), keys,
   credentials, build output and anything else that looks like a secret
   or a local artifact. Don't open them to check.
4. Show the overview in this form and nothing else:

   ```
   ## Commit overview
   Branch: <branch>

   ### Commit 1: `<type>(<scope>): <description>`
   | Status | File | Lines |
   |--------|------|-------|
   | M      | apps/server/src/.../mongo-user-repository.ts | +19 −6 |
   | A      | apps/server/src/.../user-mapper.ts           | +12    |
   | D      | apps/client/src/.../old-page.ts              | −40    |

   ### Commit 2: ...

   Not committed: <files and why>, or "none"
   ```

   Status is `A` (new), `M` (changed), `D` (deleted) or `R` (renamed);
   untracked files count as `A`. If something was already staged, say so
   below the branch line, since it ends up in the commit as well.
5. Ask with the `AskUserQuestion` tool, options: "Commit as shown",
   "Change message or split", "Cancel". The question lists only the
   commits, one per line with number and message, e.g.
   `Commit 1: fix(server): …`; no files, since they are in the overview.
   Then wait.
   - "Change message or split": apply the user's change, show the updated
     overview and ask again.
   - "Cancel": stage nothing and stop.
6. After confirmation, for each commit in the order shown: stage exactly
   its files by path (`git add -- <paths>`, `git rm` for deletions; never
   `git add -A` or `git add .`), then `git commit -m "<message>"` with the
   confirmed line only.
7. If a git hook or the commit fails, stop, report the output and don't
   retry with `--no-verify` or similar. Leave what was already committed.
8. Report the result: `git log --oneline -<number of commits>`.

Never push, amend, rebase or change the git config.
