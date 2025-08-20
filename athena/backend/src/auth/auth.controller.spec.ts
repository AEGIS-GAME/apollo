import { Test, TestingModule } from "@nestjs/testing"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { TokenPairDto } from "../token/dto/token-pair.dto"

describe("AuthController", () => {
  let controller: AuthController
  let authService: jest.Mocked<AuthService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get(AuthService)
  })

  describe("login", () => {
    it("should call authService.login with correct params", async () => {
      const dto: LoginDto = { username: "user", password: "pass" }
      const tokens: TokenPairDto = { access: "a", refresh: "b" }

      authService.login.mockResolvedValue(tokens)
      const spy = jest.spyOn(authService, "login")

      const result = await controller.login(dto)

      expect(spy).toHaveBeenCalledWith("user", "pass")
      expect(result).toEqual(tokens)
    })
  })

  describe("register", () => {
    it("should call authService.register with correct params", async () => {
      const dto: RegisterDto = { username: "new", password: "pass" }
      const tokens: TokenPairDto = { access: "x", refresh: "y" }

      authService.register.mockResolvedValue(tokens)
      const spy = jest.spyOn(authService, "register")

      const result = await controller.register(dto)

      expect(spy).toHaveBeenCalledWith("new", "pass")
      expect(result).toEqual(tokens)
    })
  })
})
