#!/usr/bin/env bash
set -euo pipefail

# post-create.sh runs only once per container. After Playwright is upgraded
# the installed browsers no longer match, so check them on every start;
# browsers already in place are skipped. Their system packages came with
# post-create.sh.
if [ -x node_modules/.bin/playwright ]; then
  npx playwright install
fi
