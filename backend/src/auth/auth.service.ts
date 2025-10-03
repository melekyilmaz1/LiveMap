import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(name: string, email: string | undefined, password: string) {
    const normalizedName = name?.trim();
    const effectiveEmail = (email?.trim() || normalizedName).toLowerCase();

    const existing = await this.usersService.findByEmail(effectiveEmail);
    if (existing) {
      throw new BadRequestException('Email already in use');
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

  async login(identifier: string, password: string) {
    if (!identifier?.trim() || !password?.trim()) {
      throw new UnauthorizedException('Identifier and password are required');
    }

    // Önce tekil eşleşme dene (email / id-email / name)
    let user = await this.usersService.findByIdentifierWithPassword(identifier);
    let ok = false;
    if (user?.passwordHash) {
      ok = await bcrypt.compare(password, user.passwordHash);
    }
    // Eğer tekil eşleşme başarısızsa ve identifier bir isim gibi görünüyorsa, aynı isme sahip
    // tüm kullanıcıları getirip parolayı sırayla dene.
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
      throw new UnauthorizedException('Invalid credentials');
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
}
