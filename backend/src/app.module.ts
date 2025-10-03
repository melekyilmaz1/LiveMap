// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { IncidentsModule } from './incidents/incidents.module';
import { UsersService } from './users/users.service';
import { User } from './users/users.entity';
import { TypeOrmModule as TOM } from '@nestjs/typeorm';
import { SeedService } from './seed/seed.service';

function asBool(v: string | undefined, def = false) {
  if (v === undefined) return def;
  return v.toLowerCase() === 'true';
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProd = process.env.NODE_ENV === 'production';
        const useMigrations = asBool(process.env.DB_USE_MIGRATIONS, false);

        // Şemayı sadece development’ta ve açıkça istenirse düşür
        const shouldDropSchema = !isProd && asBool(process.env.DB_DROP_SCHEMA, false);

        // Dev + migrations yoksa sync; prod’da veya migrations’ta sync kapalı
        const shouldSync = !useMigrations && !isProd;

        const dbHost = process.env.POSTGRES_HOST || 'localhost';
        const dbPort = parseInt(process.env.POSTGRES_PORT ?? '5432', 10);
        const dbUser = process.env.POSTGRES_USER || 'postgres';
        
        const rawPass = process.env.POSTGRES_PASSWORD;
        const dbPass = rawPass && rawPass.trim() !== '' ? rawPass : undefined;
        const dbName = process.env.POSTGRES_DB || 'postgres';

        
        console.log(
          `[DB] host=${dbHost} db=${dbName} prod=${isProd} sync=${shouldSync} migrations=${useMigrations} dropSchema=${shouldDropSchema}`,
        );

        return {
          type: 'postgres' as const,
          host: dbHost,
          port: dbPort,
          username: dbUser,
          password: dbPass,   
          database: dbName,

          autoLoadEntities: true,
          keepConnectionAlive: true,

          
          dropSchema: shouldDropSchema,

          
          synchronize: shouldSync,
          migrationsRun: useMigrations,

          migrations: [
            join(process.cwd(), 'dist', 'migrations/*{.js}'),
            join(process.cwd(), 'src', 'migrations/*{.ts}'),
          ],

          // Log seviyeleri
          logging: isProd ? ['error', 'warn'] : ['error', 'warn'],

          // Local geliştirme: SSL yok
          ssl: undefined,

          // pg pool ayarları (opsiyonel)
          extra: {
            max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
            idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE ?? '30000', 10),
            application_name: process.env.npm_package_name || 'nest-app',
          },

          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),
    TOM.forFeature([User]),
    UsersModule,
    AuthModule,
    IncidentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
