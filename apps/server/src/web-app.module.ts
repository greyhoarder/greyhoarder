import { Module } from '@nestjs/common';
import { ServeStaticModule, type ServeStaticModuleOptions } from '@nestjs/serve-static';
import type { Response } from 'express';
import { basename } from 'node:path';
import { AppConfig } from './config/app-config.js';

/**
 * Angular puts a content hash into the names of everything it builds:
 * `main-B3EGIXKZ.js`, `chunk-Mt-zXtO-.js`, `media/geist-cyrillic-wght-normal-CK2XY27K.woff2`.
 */
const HASHED_FILE = /(^[a-z]+-[\w-]{8}|-[A-Z0-9]{8})\.\w+$/;

function setCacheHeaders(response: Response, path: string): void {
  if (basename(path) === 'index.html') {
    response.setHeader('Cache-Control', 'no-cache');
  } else if (HASHED_FILE.test(basename(path))) {
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}

function webAppOptions(directory: string | undefined): ServeStaticModuleOptions[] {
  if (!directory) {
    return [];
  }
  return [
    {
      rootPath: directory,
      // Unknown API paths keep the API's 404 instead of getting the web app.
      exclude: ['/api/{*path}'],
      serveStaticOptions: { cacheControl: false, setHeaders: setCacheHeaders },
    },
  ];
}

/** Serves the client build, with `index.html` for every client route (ADR-0017). */
@Module({
  imports: [
    ServeStaticModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => webAppOptions(config.webAppDirectory),
    }),
  ],
})
export class WebAppModule {}
