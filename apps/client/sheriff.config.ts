import type { SheriffConfig } from '@softarc/sheriff-core';

/** docs/architecture-boundaries.md, "Domain dependencies": other domains each domain may use. */
const DOMAIN_DEPENDENCIES: Readonly<Record<string, readonly string[]>> = {
  auth: ['users'],
  catalog: [],
  dashboard: ['auth', 'hoard'],
  hoard: ['catalog'],
  instance: [],
  users: [],
};

/**
 * docs/architecture-boundaries.md, "Layers inside a client domain": layers of
 * its own domain each layer may use. `api/` and `<domain>.routes.ts` may use
 * every layer whose parts they publish.
 */
const LAYER_DEPENDENCIES: Readonly<Record<string, readonly string[]>> = {
  routes: ['features', 'ui', 'application', 'data', 'models', 'infrastructure', 'util'],
  api: ['routes', 'features', 'ui', 'application', 'data', 'models', 'infrastructure', 'util'],
  features: ['ui', 'application', 'data', 'infrastructure', 'models', 'util'],
  ui: ['models', 'util'],
  application: ['data', 'infrastructure', 'models', 'util'],
  data: ['infrastructure', 'models', 'util'],
  infrastructure: ['models', 'util'],
  util: ['models'],
  models: [],
};

/**
 * docs/architecture-boundaries.md, "Public API" and "Shared code": layers that
 * may use other domains' `api/` and `shared/`. `api/` re-exports only its own
 * domain, `models/` uses only `@greyhoarder/domain`.
 */
const LAYERS_USING_OTHER_DOMAINS: readonly string[] = [
  'routes',
  'features',
  'ui',
  'application',
  'data',
  'infrastructure',
  'util',
];
const LAYERS_USING_SHARED: readonly string[] = [
  'routes',
  'api',
  'features',
  'ui',
  'application',
  'data',
  'infrastructure',
  'util',
];

/**
 * docs/architecture-boundaries.md, "App level on the client" and "Shared code":
 * app-level code each app-level part may use. `root` is `main.ts`, `app.ts`,
 * `app.config.ts` and `app.routes.ts`.
 */
const APP_LEVEL_DEPENDENCIES: Readonly<Record<string, readonly string[]>> = {
  root: ['shell', 'shared'],
  shell: ['shared'],
  shared: ['shared'],
};

/**
 * docs/architecture-boundaries.md, "App level on the client": the parts of a
 * domain the app level may use. `shared/` uses no domain.
 */
const APP_LEVEL_USING_DOMAINS: readonly string[] = ['root', 'shell'];
const DOMAIN_ENTRY_LAYERS: readonly string[] = ['api', 'routes'];

type Part = { domain: string; layer: string } | { appLevel: string };

function toPart(tags: string[]): Part | undefined {
  const domain = tags.find((tag) => tag.startsWith('domain:'))?.slice('domain:'.length);
  const layer = tags.find((tag) => tag.startsWith('layer:'))?.slice('layer:'.length);
  if (domain !== undefined && layer !== undefined) {
    return { domain, layer };
  }
  const appLevel = tags.find((tag) => tag in APP_LEVEL_DEPENDENCIES);
  return appLevel === undefined ? undefined : { appLevel };
}

function isAllowed(fromTags: string[], toTags: string[]): boolean {
  const from = toPart(fromTags);
  const to = toPart(toTags);
  if (from === undefined || to === undefined) {
    return false;
  }
  if ('appLevel' in from) {
    if ('appLevel' in to) {
      return APP_LEVEL_DEPENDENCIES[from.appLevel].includes(to.appLevel);
    }
    return APP_LEVEL_USING_DOMAINS.includes(from.appLevel) && DOMAIN_ENTRY_LAYERS.includes(to.layer);
  }
  if ('appLevel' in to) {
    return to.appLevel === 'shared' && LAYERS_USING_SHARED.includes(from.layer);
  }
  if (from.domain === to.domain) {
    return LAYER_DEPENDENCIES[from.layer]?.includes(to.layer) ?? false;
  }
  return (
    to.layer === 'api' &&
    LAYERS_USING_OTHER_DOMAINS.includes(from.layer) &&
    (DOMAIN_DEPENDENCIES[from.domain]?.includes(to.domain) ?? false)
  );
}

export const config: SheriffConfig = {
  entryFile: 'src/main.ts',
  enableBarrelLess: true,
  modules: {
    'src/app/domains/<domain>': ['domain:<domain>', 'layer:routes'],
    // Before `<layer>`, so that each feature becomes a module of its own.
    'src/app/domains/<domain>/features/<feature>': ['domain:<domain>', 'layer:features'],
    'src/app/domains/<domain>/<layer>': ['domain:<domain>', 'layer:<layer>'],
    'src/app/shell': 'shell',
    'src/app/shared': 'shared',
    'src/app/shared/ui/helm/<component>/src': 'shared',
  },
  depRules: {
    '*': ({ fromTags, toTags }) => isAllowed(fromTags, toTags),
  },
};
