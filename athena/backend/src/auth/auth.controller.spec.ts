import { Test, TestingModule } from "@nestjs/testing"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { TokenPairDto } from "./dto/token-pair.dto"

describe("AuthController", () => {
  let controller: AuthController
  let authService: Partial<AuthService>

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  describe("login", () => {
    it("should call authService.login with correct params", async () => {
      const dto: LoginDto = { username: "user", password: "pass" }
      const tokens: TokenPairDto = { access: "a", refresh: "b" }

      ;(authService.login as jest.Mock).mockResolvedValue(tokens)

      const result = await controller.login(dto)

      expect(authService.login).toHaveBeenCalledWith("user", "pass")
      expect(result).toEqual(tokens)
    })
  })

  describe("register", () => {
    it("should call authService.register with correct params", async () => {
      const dto: RegisterDto = { username: "new", password: "pass" }
      const tokens: TokenPairDto = { access: "x", refresh: "y" }

      ;(authService.register as jest.Mock).mockResolvedValue(tokens)

      const result = await controller.register(dto)

      expect(authService.register).toHaveBeenCalledWith("new", "pass")
      expect(result).toEqual(tokens)
    })
  })
})
