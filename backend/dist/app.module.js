"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const incidents_module_1 = require("./incidents/incidents.module");
const users_entity_1 = require("./users/users.entity");
const typeorm_2 = require("@nestjs/typeorm");
const seed_service_1 = require("./seed/seed.service");
function asBool(v, def = false) {
    if (v === undefined)
        return def;
    return v.toLowerCase() === 'true';
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => {
                    const isProd = process.env.NODE_ENV === 'production';
                    const useMigrations = asBool(process.env.DB_USE_MIGRATIONS, false);
                    const shouldDropSchema = !isProd && asBool(process.env.DB_DROP_SCHEMA, false);
                    const shouldSync = !useMigrations && !isProd;
                    const dbHost = process.env.POSTGRES_HOST || 'localhost';
                    const dbPort = parseInt(process.env.POSTGRES_PORT ?? '5432', 10);
                    const dbUser = process.env.POSTGRES_USER || 'postgres';
                    const rawPass = process.env.POSTGRES_PASSWORD;
                    const dbPass = rawPass && rawPass.trim() !== '' ? rawPass : undefined;
                    const dbName = process.env.POSTGRES_DB || 'postgres';
                    console.log(`[DB] host=${dbHost} db=${dbName} prod=${isProd} sync=${shouldSync} migrations=${useMigrations} dropSchema=${shouldDropSchema}`);
                    return {
                        type: 'postgres',
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
                            (0, path_1.join)(process.cwd(), 'dist', 'migrations/*{.js}'),
                            (0, path_1.join)(process.cwd(), 'src', 'migrations/*{.ts}'),
                        ],
                        logging: isProd ? ['error', 'warn'] : ['error', 'warn'],
                        ssl: undefined,
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
            typeorm_2.TypeOrmModule.forFeature([users_entity_1.User]),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            incidents_module_1.IncidentsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, seed_service_1.SeedService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map