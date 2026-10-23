import { test as base } from '@playwright/test';
import { type ChildProcess, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

/** Reference data the server imports on startup (ADR-0020). */
const CATALOG_COLLECTIONS = new Set(['catalogSystems', 'catalogFactions', 'catalogKits', 'catalogImports']);

const SERVER_ENTRY = fileURLToPath(new URL('../server/dist/main.js', import.meta.url));
const WEB_APP_DIR = fileURLToPath(new URL('../client/dist/client/browser', import.meta.url));
const FIRST_PORT = 3100;
const STARTUP_TIMEOUT_MS = 30_000;

/** A server process of its own for one worker (ADR-0018). */
export interface Instance {
  readonly url: string;
  /** Empties the instance's MongoDB and Redis databases, directly and not through the app. */
  reset(): Promise<void>;
}

interface WorkerFixtures {
  instance: Instance;
}

interface TestFixtures {
  /** The worker's instance, reset to no accounts and no sessions before the test. */
  freshInstance: Instance;
  /** A fresh instance with an administrator whom the page is signed in as, through the API. */
  signedIn: Instance & { readonly username: string };
}

const ADMINISTRATOR = { username: 'mira', password: 'a long and quiet sprue' };

/** The development URL with the path replaced, so tests never touch development data. */
function withPath(url: string, path: string): string {
  const parsed = new URL(url);
  parsed.pathname = path;
  return parsed.toString();
}

async function waitUntilReady(url: string, server: ChildProcess): Promise<void> {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`The e2e server exited with code ${server.exitCode} while starting.`);
    }
    try {
      if ((await fetch(`${url}/api/health`)).ok) {
        return;
      }
    } catch {
      // Not listening yet; try again.
    }
    await delay(100);
  }
  throw new Error(`The e2e server did not answer ${url}/api/health within ${STARTUP_TIMEOUT_MS} ms.`);
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  instance: [
    async ({}, use, workerInfo) => {
      if (!existsSync(SERVER_ENTRY) || !existsSync(WEB_APP_DIR)) {
        throw new Error('End-to-end tests run against the build; run `npm run build` first.');
      }
      const index = workerInfo.parallelIndex;
      const url = `http://127.0.0.1:${FIRST_PORT + index}`;
      const mongodbUri = withPath(
        process.env['MONGODB_URI'] ?? 'mongodb://127.0.0.1:27017/?directConnection=true',
        `/greyhoarder-e2e-${index}`,
      );
      const redisUrl = withPath(process.env['REDIS_URL'] ?? 'redis://127.0.0.1:6379', `/${index + 1}`);

      const server = spawn(process.execPath, [SERVER_ENTRY], {
        env: {
          ...process.env,
          PORT: String(FIRST_PORT + index),
          MONGODB_URI: mongodbUri,
          REDIS_URL: redisUrl,
          SESSION_SECRETS: randomBytes(32).toString('hex'),
          WEB_APP_DIR,
        },
        stdio: ['ignore', 'ignore', 'inherit'],
      });
      const mongo = new MongoClient(mongodbUri);
      const redis = createClient({ url: redisUrl });

      try {
        await Promise.all([waitUntilReady(url, server), mongo.connect(), redis.connect()]);
        await use({
          url,
          reset: async () => {
            // Emptying keeps the collections and their unique indexes, which the server creates only at startup.
            // The catalog is imported only at startup as well, and no test changes it.
            const collections = await mongo.db().collections();
            await Promise.all([
              ...collections
                .filter((collection) => !CATALOG_COLLECTIONS.has(collection.collectionName))
                .map((collection) => collection.deleteMany({})),
              redis.flushDb(),
            ]);
          },
        });
      } finally {
        await Promise.all([mongo.close(), redis.isOpen ? redis.close() : undefined]);
        if (server.exitCode === null) {
          server.kill('SIGTERM');
          await once(server, 'exit');
        }
      }
    },
    { scope: 'worker' },
  ],
  freshInstance: async ({ instance }, use) => {
    await instance.reset();
    await use(instance);
  },
  signedIn: async ({ freshInstance, page }, use) => {
    // The page's request context shares its cookies, so the browser holds the session afterwards.
    const headers = { Origin: freshInstance.url };
    for (const path of ['/api/auth/setup', '/api/auth/session']) {
      const response = await page.request.post(`${freshInstance.url}${path}`, { data: ADMINISTRATOR, headers });
      if (!response.ok()) {
        throw new Error(`POST ${path} answered ${response.status()} while signing in for a test.`);
      }
    }
    await use({ ...freshInstance, username: ADMINISTRATOR.username });
  },
});

export { expect } from '@playwright/test';
