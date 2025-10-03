import { Repository } from 'typeorm';
import { User } from './users.entity';
export declare class UsersService {
    private readonly repo;
    constructor(repo: Repository<User>);
    findByIdentifierWithPassword(identifier: string): Promise<User | null>;
    findManyByNameWithPassword(name: string): Promise<User[]>;
    findByEmail(email: string): Promise<User | null>;
    createUser(name: string, email: string, passwordOrHash: string, isAlreadyHashed?: boolean): Promise<User>;
    findById(id: number | string): Promise<User>;
    updatePartial(id: number | string, patch: Partial<Pick<User, 'name' | 'email'>>): Promise<User>;
    changePassword(id: number | string, currentPassword: string, newPassword: string): Promise<void>;
    private ensureEmailIsUnique;
    private hashPassword;
    private sanitize;
}
