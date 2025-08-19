import { Test, TestingModule } from "@nestjs/testing"
import { UserController } from "./users.controller"
import { UsersService } from "./users.service"
import { Response } from "express"

describe("UserController", () => {
  let controller: UserController
  let usersService: Partial<UsersService>

  beforeEach(async () => {
    usersService = {
      create: jest.fn().mockResolvedValue({ id: 1, username: "test" }),
      generateTokens: jest.fn().mockReturnValue({
        accessToken: "access",
        refreshToken: "refresh",
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile()

    controller = module.get<UserController>(UserController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  it("should set cookies register", async () => {
    const res: Partial<Response> = {
      cookie: jest.fn(),
    }

    await controller.register({ username: "test", password: "pass" }, res as Response)

    expect(usersService.create).toHaveBeenCalledWith("test", "pass")
    expect(usersService.generateTokens).toHaveBeenCalledWith(1)
    expect(res.cookie).toHaveBeenCalledWith(
      "access_token",
      "access",
      expect.any(Object)
    )
    expect(res.cookie).toHaveBeenCalledWith(
      "refresh_token",
      "refresh",
      expect.any(Object)
    )
  })
})
