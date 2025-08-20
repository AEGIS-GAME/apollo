import { Body, Controller, Post, Res } from "@nestjs/common"
import { UsersService } from "./users.service"
import { Response } from "express"

@Controller("user")
export class UserController {
  constructor(private readonly userService: UsersService) { }

  // @Post("register")
  // async register(
  //   @Body() body: { username: string; password: string },
  //   @Res({ passthrough: true }) res: Response
  // ) {
  //   const user = await this.userService.create(body.username, body.password)
  //   const tokens = this.userService.generateTokens(user.id)
  //
  //   res.cookie("access_token", tokens.accessToken, {
  //     httpOnly: true,
  //     sameSite: "strict",
  //     maxAge: 15 * 60 * 1000, // 15min
  //   })
  //
  //   res.cookie("refresh_token", tokens.refreshToken, {
  //     httpOnly: true,
  //     sameSite: "strict",
  //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  //   })
  //
  //   return { message: "Registered successfully" }
  // }
}
