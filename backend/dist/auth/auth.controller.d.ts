import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(dto: SignupDto): Promise<{
        access_token: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    headLogin(): void;
    health(): {
        status: string;
    };
}
