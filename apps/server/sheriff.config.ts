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
 * docs/architecture-boundaries.md, "Layers inside a server domain": layers of
 * its own domain each layer may use. `api/` and `<domain>.module.ts` may use
 * every layer whose parts they publish or bind.
 */
const LAYER_DEPENDENCIES: Readonly<Record<string, readonly string[]>> = {
  module: ['features', 'models', 'ports', 'infrastructure', 'util'],
  api: ['module', 'features', 'models', 'ports', 'infrastructure', 'util'],
  features: ['ports', 'models', 'util'],
  infrastructure: ['ports', 'models', 'util'],
  ports: ['models'],
  util: ['models'],
  models: [],
};

/**
 * docs/architecture-boundaries.md, "Public API", "App level on the server" and
 * "Shared code": app-level code and other domains' `api/` each layer may use.
 * `api/` re-exports only its own domain, `models/` uses only
 * `@greyhoarder/domain`, ports use only `models/`.
 */
const LAYERS_USING_OTHER_DOMAINS: readonly string[] = ['module', 'features', 'infrastructure', 'util'];
const LAYERS_USING_SHARED: readonly string[] = ['module', 'api', 'features', 'infrastructure', 'util'];
const LAYERS_USING_CONFIG: readonly string[] = ['module', 'features', 'infrastructure'];
const LAYERS_USING_PLATFORM: readonly string[] = ['module', 'infrastructure'];

/**
 * docs/architecture-boundaries.md, "App level on the server" and "Shared
 * code": app-level code each app-level part may use. `root` is the
 * composition root besides `config/`: `main.ts`, `app.module.ts` and the
 * modules next to them.
 */
const APP_LEVEL_DEPENDENCIES: Readonly<Record<string, readonly string[]>> = {
  root: ['config', 'platform', 'shared'],
  config: [],
  platform: ['config'],
  shared: ['shared'],
};

/**
 * docs/architecture-boundaries.md, "App level on the server": the parts of a
 * domain the app level may use. `shared/` uses no domain.
 */
const APP_LEVEL_USING_DOMAINS: readonly string[] = ['root', 'config', 'platform'];
const DOMAIN_ENTRY_LAYERS: readonly string[] = ['api', 'module'];

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

function isAllowedIntoAppLevel(fromLayer: string, appLevel: string): boolean {
  switch (appLevel) {
    case 'shared':
      return LAYERS_USING_SHARED.includes(fromLayer);
    case 'config':
      return LAYERS_USING_CONFIG.includes(fromLayer);
    case 'platform':
      return LAYERS_USING_PLATFORM.includes(fromLayer);
    default:
      return false;
  }
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
    return isAllowedIntoAppLevel(from.layer, to.appLevel);
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
    'src/domains/<domain>': ['domain:<domain>', 'layer:module'],
    // Before `<layer>`, so that each feature becomes a module of its own.
    'src/domains/<domain>/features/<feature>': ['domain:<domain>', 'layer:features'],
    'src/domains/<domain>/<layer>': ['domain:<domain>', 'layer:<layer>'],
    'src/config': 'config',
    'src/platform': 'platform',
    'src/shared': 'shared',
  },
  depRules: {
    '*': ({ fromTags, toTags }) => isAllowed(fromTags, toTags),
  },
};
