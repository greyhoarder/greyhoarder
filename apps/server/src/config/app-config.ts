import { fileURLToPath } from 'node:url';
import { z } from 'zod';

/** Development values; only used when the server is started with `--dev`. */
const DEVELOPMENT_DEFAULTS = {
  MONGODB_URI: 'mongodb://127.0.0.1:27017/greyhoarder?directConnection=true',
  REDIS_URL: 'redis://127.0.0.1:6379',
  SESSION_SECRETS: 'insecure-development-secret',
};

/** The catalog submodule this release ships with (ADR-0020); the same depth from `src/` and `dist/`. */
const CATALOG_DIRECTORY = fileURLToPath(new URL('../../../../libs/catalog/', import.meta.url));

const environmentSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1),
  REDIS_URL: z.string().min(1),
  /** Comma-separated; the first signs new cookies, all verify (rotation, ADR-0009). */
  SESSION_SECRETS: z
    .string()
    .transform((value) =>
      value
        .split(',')
        .map((secret) => secret.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().min(16)).min(1)),
  SESSION_IDLE_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(7 * 24 * 60),
  SESSION_MAX_DAYS: z.coerce.number().int().positive().default(30),
  /** The client build; without it the server serves only the API (ADR-0017). */
  WEB_APP_DIR: z.string().min(1).optional(),
});

/** Validated configuration from environment variables; no `.env` files. */
export class AppConfig {
  readonly port: number;
  readonly mongodbUri: string;
  readonly redisUrl: string;
  readonly sessionSecrets: readonly string[];
  readonly sessionIdleSeconds: number;
  readonly sessionMaxLifetimeMs: number;
  readonly webAppDirectory: string | undefined;
  readonly catalogDirectory = CATALOG_DIRECTORY;

  constructor(environment: NodeJS.ProcessEnv, development: boolean) {
    const result = environmentSchema.safeParse(development ? { ...DEVELOPMENT_DEFAULTS, ...environment } : environment);
    if (!result.success) {
      throw new Error(`Invalid configuration:\n${z.prettifyError(result.error)}`);
    }
    const env = result.data;
    if (!development && env.SESSION_SECRETS.includes(DEVELOPMENT_DEFAULTS.SESSION_SECRETS)) {
      throw new Error('Invalid configuration: the development session secret is not allowed.');
    }

    this.port = env.PORT;
    this.mongodbUri = env.MONGODB_URI;
    this.redisUrl = env.REDIS_URL;
    this.sessionSecrets = env.SESSION_SECRETS;
    this.sessionIdleSeconds = env.SESSION_IDLE_MINUTES * 60;
    this.sessionMaxLifetimeMs = env.SESSION_MAX_DAYS * 24 * 60 * 60 * 1000;
    this.webAppDirectory = env.WEB_APP_DIR;
  }
}
