import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    await this.ensureUser('melek', 'melek+1@id.local', '1');
    await this.ensureUser('melek', 'melek+2@id.local', '2');
  }

  private async ensureUser(name: string, email: string, password: string) {
    const exists = await this.usersService.findByEmail(email);
    if (!exists) {
      await this.usersService.createUser(name, email, password, false);
    }
  }
}




