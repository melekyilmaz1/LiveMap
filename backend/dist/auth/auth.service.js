"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async signup(name, email, password) {
        const normalizedName = name?.trim();
        const effectiveEmail = (email?.trim() || normalizedName).toLowerCase();
        const existing = await this.usersService.findByEmail(effectiveEmail);
        if (existing) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const user = await this.usersService.createUser(normalizedName, effectiveEmail, passwordHash, true);
        const token = await this.jwtService.signAsync({ sub: user.id, email: user.email, name: user.name });
        return {
            access_token: token,
            user: { id: user.id, name: user.name, email: user.email },
        };
    }
    async login(identifier, password) {
        if (!identifier?.trim() || !password?.trim()) {
            throw new common_1.UnauthorizedException('Identifier and password are required');
        }
        let user = await this.usersService.findByIdentifierWithPassword(identifier);
        let ok = false;
        if (user?.passwordHash) {
            ok = await bcrypt.compare(password, user.passwordHash);
        }
        if (!ok) {
            const candidates = await this.usersService.findManyByNameWithPassword(identifier);
            for (const cand of candidates) {
                if (cand.passwordHash && (await bcrypt.compare(password, cand.passwordHash))) {
                    user = cand;
                    ok = true;
                    break;
                }
            }
        }
        if (!ok || !user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
            name: user.name,
        });
        return {
            access_token: token,
            user: { id: user.id, name: user.name, email: user.email },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map