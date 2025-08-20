import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("login")
  async signIn(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.username, loginDto.password)
  }
}
