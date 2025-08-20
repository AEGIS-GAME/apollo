import { Test, TestingModule } from "@nestjs/testing"
import { TokenController } from "./token.controller"
import { TokenService } from "./token.service"
import { TokenDto } from "./dto/token.dto"

describe("TokenController", () => {
  let controller: TokenController
  let tokenService: jest.Mocked<TokenService>

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
    tokenService = module.get(TokenService)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("refresh", () => {
    it("should call tokenService.generateAccessToken with the user ID", () => {
      const fakeUser: TokenDto = { sub: 42, iat: 1000, exp: 2000 }

      const signSpy = jest
        .spyOn(tokenService, "generateAccessToken")
        .mockReturnValue("access-token")

      const result = controller.refresh({ user: fakeUser })

      expect(signSpy).toHaveBeenCalledWith(42)
      expect(result).toEqual({ access: "access-token" })
    })
  })

  describe("validate", () => {
    it("should return undefined and succeed (204)", () => {
      const result = controller.validate()
      expect(result).toBeUndefined()
    })
  })
})
