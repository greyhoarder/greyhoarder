import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './domains/auth/api/index.js';
import { InstanceModule } from './domains/instance/api/index.js';
import { UsersModule } from './domains/users/api/index.js';
import { AppConfig } from './config/app-config.js';
import { ConfigModule } from './config/config.module.js';
import { RedisModule } from './platform/redis/redis.module.js';
import { WebAppModule } from './web-app.module.js';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({ uri: config.mongodbUri }),
    }),
    RedisModule,
    WebAppModule,
    UsersModule,
    AuthModule,
    InstanceModule,
  ],
  providers: [
    // Requests are validated and responses serialized through protocol schemas (ADR-0015).
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ],
})
export class AppModule {}
