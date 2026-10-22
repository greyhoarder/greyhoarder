#!/usr/bin/env bash
set -euo pipefail

# Docker creates the named volumes as root.
sudo chown node:node node_modules apps/client/node_modules apps/server/node_modules \
  libs/protocol/node_modules /home/node/.claude

# The bind mount from a Windows host is owned by root, so Git would refuse
# the repository as dubious. System config, because VS Code copies the
# host's ~/.gitconfig only when the container has none.
sudo git config --system --add safe.directory "$PWD"

npm ci

# Browsers must match the installed Playwright version, so they come only
# once a workspace (apps/e2e) depends on Playwright.
if [ -x node_modules/.bin/playwright ]; then
  npx playwright install --with-deps
fi
