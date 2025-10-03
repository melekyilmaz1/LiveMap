import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.name, dto.email, dto.password);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}


