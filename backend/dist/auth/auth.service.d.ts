import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    signup(name: string, email: string | undefined, password: string): Promise<{
        access_token: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    login(identifier: string, password: string): Promise<{
        access_token: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
}
