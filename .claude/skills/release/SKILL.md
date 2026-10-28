---
name: release
description: Make a release of greyhoarder with release-it (version, changelog, tag, push), after showing the version and changelog and getting the user's confirmation. Use only when the user explicitly asks for a release ("release", "wir machen jetzt das Release", "mach ein Release"); never on your own initiative or as part of another task.
---

# Release

Make a release only because the user asked for one in this conversation.
Never start it on your own, as a follow-up of another task or because a
change "is ready". If unsure whether the user meant a release, ask.

1. Read `docs/architecture-releases.md`. Its rules decide the version; the
   tool applies them, don't reinterpret them.
2. Check the preconditions with git and stop at the first that fails,
   naming what is wrong; don't fix it on your own:
   - the branch is `main`;
   - the working tree is clean (`git status --short`), the catalog
     submodule included;
   - `main` is up to date with `origin/main` (`git fetch`, then
     `git status -sb`).
3. Preview the release:
   `npm run release -- --ci --changelog 2>&1 | grep -vE "^npm notice"`.
   It runs lint, tests and build of every workspace first, then prints the
   changelog of the next release, headed by its version. Nothing is
   written yet. If a check fails, stop and report the failure; never skip
   or weaken a check to release anyway.
4. Pick the version:
   - normally the one the preview printed;
   - if there is no tag `v*` yet, propose `0.1.0` (first release);
   - `1.0.0` only when the user asks for the first public release; then
     `preMajor` is removed from `.release-it.json` in the same release,
     after asking.
5. Show the user the version and the changelog from the preview, then ask
   with the `AskUserQuestion` tool, options: "Release v<version>",
   "Other version", "Cancel". Then wait.
   - "Other version": ask which one and check it against the rules of
     the guide; a version that skips or contradicts them needs an explicit
     confirmation.
   - "Cancel": change nothing and stop.
6. Release:
   - the previewed version: `npm run release -- --ci`;
   - another version: `npm run release -- <version> --ci`.

   Keep the output short (`2>&1 | grep -vE "^npm notice"`, then the last
   lines). release-it runs the checks again, writes the versions and
   `CHANGELOG.md`, commits `chore(release): v<version>`, tags
   `v<version>` and pushes both.
7. If the release fails after it started writing (e.g. the push is
   rejected), report the output and what exists locally (`git log
   --oneline -1`, `git tag --points-at HEAD`). Don't retry, force-push,
   delete tags or reset; the user decides.
8. Report the result: the version, the tag and `git log --oneline -1`.

Never change versions or `CHANGELOG.md` by hand, never publish anything
else (npm, GitHub release, image), and never change the git config.
