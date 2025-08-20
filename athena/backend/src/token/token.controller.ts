import { Controller, HttpCode, Post, Request } from "@nestjs/common"
import { TokenDto } from "./dto/token.dto"
import { TokenService } from "./token.service"

@Controller("token")
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post("/refresh")
  refresh(@Request() req: { user: TokenDto }) {
    const userId = req.user.sub
    return { access: this.tokenService.generateAccessToken(userId) }
  }

  @Post("/validate")
  @HttpCode(204)
  validate() {
    // If we reach here, the token is valid cause of the auth guard
  }
}
