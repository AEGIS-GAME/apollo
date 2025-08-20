import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common"
import { Kysely } from "kysely"
import { DB } from "src/db/types"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"

@Injectable()
export class UsersService {
  constructor(@Inject("DB") private readonly db: Kysely<DB>) { }

  async getUserByUsername(username: string) {
    const user = await this.db
      .selectFrom("users")
      .where("username", "=", username)
      .selectAll()
      .executeTakeFirst()

    if (!user) throw new NotFoundException("User not found")

    return user
  }

  // async create(username: string, password: string) {
  //   const existing = await this.db
  //     .selectFrom("users")
  //     .select("id")
  //     .where("username", "=", username)
  //     .executeTakeFirst()
  //
  //   if (existing) throw new ConflictException("Username already taken")
  //
  //   const password_hash = await bcrypt.hash(password, this.SALT_ROUNDS)
  //
  //   const user = await this.db
  //     .insertInto("users")
  //     .values({ username, password_hash, is_admin: false })
  //     .returningAll()
  //     .executeTakeFirst()
  //
  //   if (!user) {
  //     throw new InternalServerErrorException("Failed to create user")
  //   }
  //
  //   return user
  // }
  //
  // generateTokens(userId: number) {
  //   const accessToken = jwt.sign({ sub: userId }, process.env.ACCESS_TOKEN_SECRET!, {
  //     expiresIn: "15m",
  //   })
  //
  //   const refreshToken = jwt.sign({ sub: userId }, process.env.REFRESH_TOKEN_SECRET!, {
  //     expiresIn: "7d",
  //   })
  //
  //   return { accessToken, refreshToken }
  // }
}
