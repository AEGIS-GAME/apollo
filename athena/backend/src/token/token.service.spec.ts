import { Test, TestingModule } from "@nestjs/testing"
import { TokenService } from "./token.service"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"

describe("TokenService", () => {
  let service: TokenService
  // let jwtService: jest.Mocked<JwtService>
  // let configService: jest.Mocked<ConfigService>

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
    // jwtService = module.get(JwtService)
    // configService = module.get(ConfigService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
