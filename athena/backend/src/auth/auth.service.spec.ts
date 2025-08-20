import * as bcrypt from "bcrypt"
import { Test, TestingModule } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { UsersService } from "../users/users.service"
import { Users } from "../users/entities/users.entity"
import { TokenService } from "../token/token.service"
import { ConflictException, UnauthorizedException } from "@nestjs/common"

describe("AuthService", () => {
  let service: AuthService
  let usersService: jest.Mocked<UsersService>
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getUserByUsername: jest.fn(),
            userExists: jest.fn(),
            insertUser: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokenPair: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    usersService = module.get(UsersService)
    tokenService = module.get(TokenService);
  })

  describe("login", () => {
    it("should throw Unauthorized if user not found", async () => {
      usersService.getUserByUsername.mockResolvedValue(null)

      await expect(service.login("baduser", "pass")).rejects.toThrow(
        UnauthorizedException
      )
    })

    it("should throw Unauthorized if password is wrong", async () => {
      const user = {
        id: 1,
        username: "test",
        password: await bcrypt.hash("correct", 10),
      }
      usersService.getUserByUsername.mockResolvedValue(user)

      await expect(service.login("test", "wrong")).rejects.toThrow(
        UnauthorizedException
      )
    })

    it("should return tokens if credentials are valid", async () => {
      const user = {
        id: 1,
        username: "test",
        password: await bcrypt.hash("correct", 10),
      }
      usersService.getUserByUsername.mockResolvedValue(user)

      tokenService.generateTokenPair.mockReturnValue({
        access: "fake-access",
        refresh: "fake-refresh",
      });

      const result = await service.login("test", "correct")
      expect(result).toEqual({
        access: "fake-access",
        refresh: "fake-refresh",
      })
    })
  })

  describe("register", () => {
    it("should throw Conflict if username taken", async () => {
      usersService.userExists.mockResolvedValue(true)

      await expect(service.register("taken", "pass")).rejects.toThrow(ConflictException)
    })

    it("should return tokens if registration succeeds", async () => {
      usersService.userExists.mockResolvedValue(false)

      const mockUser: Partial<Users> = { id: 1, username: "new" }
      usersService.insertUser.mockResolvedValue(mockUser as Users)
      usersService.getUserByUsername.mockResolvedValue({
        id: 1,
        username: "new",
        password: "hashed",
      })

      tokenService.generateTokenPair.mockReturnValue({
        access: "fake-access",
        refresh: "fake-refresh",
      });

      const result = await service.register("new", "pass")
      expect(result).toEqual({
        access: "fake-access",
        refresh: "fake-refresh",
      })
    })
  })
})
