import { Test, TestingModule } from "@nestjs/testing"
import { TokenController } from "./token.controller"
import { TokenService } from "./token.service"

describe("TokenController", () => {
  let controller: TokenController
  // let tokenService: jest.Mocked<TokenService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            generateTokenPair: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<TokenController>(TokenController)
    // tokenService = module.get(TokenService)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
