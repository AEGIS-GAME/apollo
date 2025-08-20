import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt"
import { ConfigService } from '@nestjs/config';
import { TokenPairDto } from './dto/token-pair.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  private readonly SALT_ROUNDS = 10

  async login(username: string, password: string): Promise<any> {
    const user = await this.usersService.getUserByUsername(username)

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      throw new UnauthorizedException()
    }
  }

  generateTokens(userId: number): TokenPairDto {
    const accessSecret = this.configService.get<string>("JWT_ACCESS_SECRET")
    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET")

    const access = this.jwtService.sign({ sub: userId }, {
      secret: accessSecret,
      expiresIn: "15m"
    })

    const refresh = this.jwtService.sign({ sub: userId }, {
      secret: refreshSecret,
      expiresIn: "7d"
    })

    return { access, refresh }
  }
}
