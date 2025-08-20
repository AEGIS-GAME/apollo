import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { TokenPairDto } from "./dto/token-pair.dto"

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  generateAccessToken(userId: number): string {
    const accessSecret = this.configService.get<string>("JWT_ACCESS_SECRET")

    return this.jwtService.sign(
      { sub: userId },
      {
        secret: accessSecret,
        expiresIn: "15m",
      }
    )
  }

  generateRefreshToken(userId: number): string {
    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET")

    return this.jwtService.sign(
      { sub: userId },
      {
        secret: refreshSecret,
        expiresIn: "7d",
      }
    )
  }

  generateTokenPair(userId: number): TokenPairDto {
    return {
      access: this.generateAccessToken(userId),
      refresh: this.generateRefreshToken(userId),
    }
  }
}
