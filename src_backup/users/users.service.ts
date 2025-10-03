import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, select: ['id', 'name', 'email', 'passwordHash'] });
  }

  async createUser(name: string, email: string, passwordHash: string): Promise<User> {
    const user = this.userRepository.create({ name, email, passwordHash });
    return this.userRepository.save(user);
  }
}


