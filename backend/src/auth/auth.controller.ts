import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Head,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Signup -> 201 (Created)
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.name, dto.email, dto.password);
  }

  // Login -> 200 (OK)
  @Post('login')
  @HttpCode(HttpStatus.OK) // <-- 200 OK, iOS artık 201 görmeyecek
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: LoginDto) {
    // Geçersiz kimlik bilgileri için AuthService zaten UnauthorizedException fırlatıyor
    return this.authService.login(dto.identifier, dto.password); // { access_token, user }
  }

  // iOS'un HEAD /auth/login ping'i için (erişilebilirlik kontrolü)
  @Head('login')
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  headLogin(): void {
    // içerik dönme
  }

  // Alternatif sağlık kontrolü (isteğe bağlı)
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok' };
  }
}
