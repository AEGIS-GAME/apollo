import { Body, Controller, Post } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"
import { TokenPairDto } from "./dto/token-pair.dto"
import { Public } from "./decorators/public.decorator"
import { RegisterDto } from "./dto/register.dto"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  async login(@Body() loginDto: LoginDto): Promise<TokenPairDto> {
    return await this.authService.login(loginDto.username, loginDto.password)
  }

  @Public()
  @Post("register")
  async register(@Body() registerDto: RegisterDto): Promise<TokenPairDto> {
    return await this.authService.register(registerDto.username, registerDto.password)
  }
}
