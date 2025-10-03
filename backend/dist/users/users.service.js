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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const users_entity_1 = require("./users.entity");
let UsersService = class UsersService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findByIdentifierWithPassword(identifier) {
        const isDigitsOnly = /^\d+$/.test(identifier);
        const emailFromId = isDigitsOnly ? `${identifier}@id.local` : null;
        const qb = this.repo
            .createQueryBuilder('u')
            .addSelect('u.passwordHash');
        qb.where('u.email = :identifier', { identifier })
            .orWhere('u.name = :identifier', { identifier });
        if (emailFromId) {
            qb.orWhere('u.email = :emailFromId', { emailFromId });
        }
        return qb.getOne();
    }
    async findManyByNameWithPassword(name) {
        return this.repo
            .createQueryBuilder('u')
            .where('u.name = :name', { name })
            .addSelect('u.passwordHash')
            .getMany();
    }
    async findByEmail(email) {
        return this.repo.findOne({
            where: { email: email.trim().toLowerCase() },
        });
    }
    async createUser(name, email, passwordOrHash, isAlreadyHashed = false) {
        await this.ensureEmailIsUnique(email);
        const passwordHash = isAlreadyHashed
            ? passwordOrHash
            : await this.hashPassword(passwordOrHash);
        const user = this.repo.create({
            name: name?.trim() ?? null,
            email: email.trim().toLowerCase(),
            passwordHash,
        });
        const saved = await this.repo.save(user);
        return this.sanitize(saved);
    }
    async findById(id) {
        const numericId = typeof id === 'string' ? Number(id) : id;
        if (!Number.isFinite(numericId)) {
            throw new common_1.BadRequestException('Geçersiz kullanıcı kimliği');
        }
        const user = await this.repo.findOne({ where: { id: numericId } });
        if (!user)
            throw new common_1.NotFoundException('Kullanıcı bulunamadı');
        return user;
    }
    async updatePartial(id, patch) {
        const user = await this.findById(id);
        if (patch.email && patch.email.trim().toLowerCase() !== user.email) {
            await this.ensureEmailIsUnique(patch.email);
            user.email = patch.email.trim().toLowerCase();
        }
        if (patch.name !== undefined) {
            user.name = patch.name?.trim() ?? null;
        }
        const saved = await this.repo.save(user);
        return this.sanitize(saved);
    }
    async changePassword(id, currentPassword, newPassword) {
        const numericId = typeof id === 'string' ? Number(id) : id;
        if (!Number.isFinite(numericId)) {
            throw new common_1.BadRequestException('Geçersiz kullanıcı kimliği');
        }
        const qb = this.repo
            .createQueryBuilder('u')
            .where('u.id = :id', { id: numericId })
            .addSelect('u.passwordHash');
        const user = await qb.getOne();
        if (!user)
            throw new common_1.NotFoundException('Kullanıcı bulunamadı');
        const ok = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!ok)
            throw new common_1.ForbiddenException('Mevcut parola hatalı');
        user.passwordHash = await this.hashPassword(newPassword);
        await this.repo.save(user);
    }
    async ensureEmailIsUnique(email) {
        const exists = await this.repo.exist({
            where: { email: email.trim().toLowerCase() },
        });
        if (exists)
            throw new common_1.ConflictException('Bu e-posta zaten kayıtlı');
    }
    async hashPassword(raw) {
        if (!raw || raw.length < 1) {
            throw new common_1.BadRequestException('Parola gerekli');
        }
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(raw, salt);
    }
    sanitize(u) {
        if (u && 'passwordHash' in u) {
            delete u.passwordHash;
        }
        return u;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map