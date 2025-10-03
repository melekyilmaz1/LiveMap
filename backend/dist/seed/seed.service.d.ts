import { OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';
export declare class SeedService implements OnApplicationBootstrap {
    private readonly usersService;
    constructor(usersService: UsersService);
    onApplicationBootstrap(): Promise<void>;
    private ensureUser;
}
