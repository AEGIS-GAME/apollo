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
import { CreateUserDto } from "./dto/create-user.dto"

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

  async userExists(username: string): Promise<boolean> {
    const user = await this.db
      .selectFrom("users")
      .where("username", "=", username)
      .select("id")
      .executeTakeFirst()

    return !!user
  }

  async insertUser(dto: CreateUserDto): Promise<void> {
    const { username, password, admin = false } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await this.db
        .insertInto("users")
        .values({
          username,
          password_hash: hashedPassword,
          admin,
        })
        .execute();
    } catch (err: any) {
      console.log(err)
      if (err.code === "SQLITE_CONSTRAINT") {
        throw new ConflictException("Username already taken");
      }
      throw new InternalServerErrorException("Failed to create user");
    }
  }
}
