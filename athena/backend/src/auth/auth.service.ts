import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
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

  async login(username: string, password: string): Promise<TokenPairDto> {
    const user = await this.usersService.getUserByUsername(username)

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      throw new UnauthorizedException()
    }

    return this.generateTokens(user.id)
  }

  async register(username: string, password: string): Promise<TokenPairDto> {
    const exists = await this.usersService.userExists(username)

    if (exists) throw new ConflictException("Username already taken")

    await this.usersService.insertUser({ username, password, admin: false });

    const user = await this.usersService.getUserByUsername(username);
    if (!user) {
      throw new InternalServerErrorException("Failed to create user")
    }

    return this.generateTokens(user.id)
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
