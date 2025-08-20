import * as bcrypt from "bcrypt"
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { UsersService } from "../users/users.service"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { TokenPairDto } from "./dto/token-pair.dto"

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async login(username: string, password: string): Promise<TokenPairDto> {
    const user = await this.usersService.getUserByUsername(username)

    if (!user) throw new UnauthorizedException("Invalid credentials")

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new UnauthorizedException()
    }

    return this.generateTokens(user.id)
  }

  async register(username: string, password: string): Promise<TokenPairDto> {
    const exists = await this.usersService.userExists(username)
    if (exists) throw new ConflictException("Username already taken")

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await this.usersService.insertUser({
      username,
      password: hashedPassword,
      admin: false,
    })

    return this.generateTokens(user.id)
  }

  generateTokens(userId: number): TokenPairDto {
    const accessSecret = this.configService.get<string>("JWT_ACCESS_SECRET")
    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET")

    const access = this.jwtService.sign(
      { sub: userId },
      {
        secret: accessSecret,
        expiresIn: "15m",
      }
    )

    const refresh = this.jwtService.sign(
      { sub: userId },
      {
        secret: refreshSecret,
        expiresIn: "7d",
      }
    )

    return { access, refresh }
  }
}
