import { Test, TestingModule } from "@nestjs/testing"
import { TokenService } from "./token.service"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { TokenPairDto } from "./dto/token-pair.dto"

describe("TokenService", () => {
  let service: TokenService
  let jwtService: jest.Mocked<JwtService>
  let configService: jest.Mocked<ConfigService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile()

    service = module.get<TokenService>(TokenService)
    jwtService = module.get(JwtService)
    configService = module.get(ConfigService)
  })

  it("generateAccessToken should call jwt.sign with correct args", () => {
    configService.get.mockReturnValue("access-secret")
    jwtService.sign.mockReturnValue("fake-access-token")

    const token = service.generateAccessToken(42)
    expect(configService.get).toHaveBeenCalledWith("JWT_ACCESS_SECRET")
    expect(jwtService.sign).toHaveBeenCalledWith(
      { sub: 42 },
      { secret: "access-secret", expiresIn: "15m" }
    )
    expect(token).toBe("fake-access-token")
  })

  it("generateRefreshToken should call jwt.sign with correct args", () => {
    configService.get.mockReturnValue("refresh-secret")
    jwtService.sign.mockReturnValue("fake-refresh-token")

    const token = service.generateRefreshToken(42)
    expect(configService.get).toHaveBeenCalledWith("JWT_REFRESH_SECRET")
    expect(jwtService.sign).toHaveBeenCalledWith(
      { sub: 42 },
      { secret: "refresh-secret", expiresIn: "7d" }
    )
    expect(token).toBe("fake-refresh-token")
  })

  it("generateTokenPair should return both access and refresh tokens", () => {
    jest.spyOn(service, "generateAccessToken").mockReturnValue("access")
    jest.spyOn(service, "generateRefreshToken").mockReturnValue("refresh")

    const pair: TokenPairDto = service.generateTokenPair(42)
    expect(pair).toEqual({ access: "access", refresh: "refresh" })
  })
})
