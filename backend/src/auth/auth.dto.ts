// src/auth/auth.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Email artık zorunlu değil; eğer gelmezse backend name'i kullanır
  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
