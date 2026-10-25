#!/usr/bin/env bash
set -euo pipefail

# Docker creates the named volumes as root.
sudo chown node:node node_modules apps/client/node_modules apps/server/node_modules \
  libs/protocol/node_modules /home/node/.claude

# The bind mount from a Windows host is owned by root, so Git would refuse
# the repository as dubious. System config, because VS Code copies the
# host's ~/.gitconfig only when the container has none.
sudo git config --system --add safe.directory "$PWD"
sudo git config --system --add safe.directory "$PWD/libs/catalog"

# The community kit catalog is a submodule; a plain clone leaves it empty.
git submodule update --init

npm ci

# Browsers must match the installed Playwright version, so they come only
# once a workspace (tests/e2e) depends on Playwright.
if [ -x node_modules/.bin/playwright ]; then
  npx playwright install --with-deps
fi
