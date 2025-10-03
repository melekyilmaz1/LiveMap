
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

 
  
  async findByIdentifierWithPassword(identifier: string): Promise<User | null> {
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

  /** Aynı isme sahip birden fazla kullanıcı varsa parolayı kontrol edebilmek için hepsini getir. */
  async findManyByNameWithPassword(name: string): Promise<User[]> {
    return this.repo
      .createQueryBuilder('u')
      .where('u.name = :name', { name })
      .addSelect('u.passwordHash')
      .getMany();
  }

  
  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  
  async createUser(
    name: string,
    email: string,
    passwordOrHash: string,
    isAlreadyHashed = false,
  ): Promise<User> {
    await this.ensureEmailIsUnique(email);

    const passwordHash = isAlreadyHashed
      ? passwordOrHash
      : await this.hashPassword(passwordOrHash);

    const user = this.repo.create({
      name: name?.trim() ?? null,
      email: email.trim().toLowerCase(),
      passwordHash,
      // İhtiyaca göre defaultlar eklenebilir: isActive: true, roles: ['user'] vb.
    });

    const saved = await this.repo.save(user);
    return this.sanitize(saved);
  }

  /** ID ile getir (parolasız). id number ise direkt, string gelirse sayıya çevirir. */
  async findById(id: number | string): Promise<User> {
    const numericId = typeof id === 'string' ? Number(id) : id;
    if (!Number.isFinite(numericId)) {
      throw new BadRequestException('Geçersiz kullanıcı kimliği');
    }

    const user = await this.repo.findOne({ where: { id: numericId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return user;
  }

  /** Kısmi güncelleme: name / email */
  async updatePartial(
    id: number | string,
    patch: Partial<Pick<User, 'name' | 'email'>>,
  ): Promise<User> {
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

  /** Parola değiştir (mevcut parolayı doğrular) */
  async changePassword(
    id: number | string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const numericId = typeof id === 'string' ? Number(id) : id;
    if (!Number.isFinite(numericId)) {
      throw new BadRequestException('Geçersiz kullanıcı kimliği');
    }

    const qb = this.repo
      .createQueryBuilder('u')
      .where('u.id = :id', { id: numericId })
      .addSelect('u.passwordHash');

    const user = await qb.getOne();
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new ForbiddenException('Mevcut parola hatalı');

    user.passwordHash = await this.hashPassword(newPassword);
    await this.repo.save(user);
  }

  // -----------------------
  // Yardımcılar
  // -----------------------

  private async ensureEmailIsUnique(email: string) {
    const exists = await this.repo.exist({
      where: { email: email.trim().toLowerCase() },
      // soft-delete çakışmalarını da saymak istiyorsan TypeORM ile ayrıca kontrol etmen gerekebilir.
    });
    if (exists) throw new ConflictException('Bu e-posta zaten kayıtlı');
  }

  private async hashPassword(raw: string) {
    if (!raw || raw.length < 1) {
      throw new BadRequestException('Parola gerekli');
    }
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(raw, salt);
  }

  /** Dönüşlerde güvenlik (passwordHash’i gizle) */
  private sanitize<T extends Partial<User>>(u: T): T {
    if (u && 'passwordHash' in u) {
      delete (u as any).passwordHash;
    }
    return u;
  }
}
