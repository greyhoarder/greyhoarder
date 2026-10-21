import { z } from 'zod';

/** Development values; only used when the server is started with `--dev`. */
const developmentDefaults = {
  MONGODB_URI: 'mongodb://127.0.0.1:27017/greyhoarder?directConnection=true',
};

const environmentSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1),
});

/** Validated configuration from environment variables; no `.env` files. */
export class AppConfig {
  readonly port: number;
  readonly mongodbUri: string;

  constructor(environment: NodeJS.ProcessEnv, development: boolean) {
    const result = environmentSchema.safeParse(
      development ? { ...developmentDefaults, ...environment } : environment,
    );
    if (!result.success) {
      throw new Error(`Invalid configuration:\n${z.prettifyError(result.error)}`);
    }

    this.port = result.data.PORT;
    this.mongodbUri = result.data.MONGODB_URI;
  }
}
