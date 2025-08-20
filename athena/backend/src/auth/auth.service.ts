import * as bcrypt from "bcrypt"
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common"
import { UsersService } from "../users/users.service"
import { TokenService } from "../token/token.service"
import { TokenPairDto } from "../token/dto/token-pair.dto"

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService
  ) {}

  async login(username: string, password: string): Promise<TokenPairDto> {
    const user = await this.usersService.getUserByUsername(username)

    if (!user) throw new UnauthorizedException("Invalid credentials")

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new UnauthorizedException()
    }

    return this.tokenService.generateTokenPair(user.id)
  }

  async register(username: string, password: string): Promise<TokenPairDto> {
    const exists = await this.usersService.userExists(username)
    if (exists) throw new ConflictException("Username already taken")

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await this.usersService.insertUser({
      username,
      password: hashedPassword,
      admin: false,
    })

    return this.tokenService.generateTokenPair(user.id)
  }
}
