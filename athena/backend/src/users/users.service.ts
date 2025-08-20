import * as bcrypt from "bcrypt"
import { Injectable } from "@nestjs/common"
import { Repository } from "typeorm"
import { CreateUserDto } from "./dto/create-user.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { Users } from "./entities/users.entity"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>
  ) { }

  async getUserByUsername(username: string) {
    return this.usersRepo.findOneBy({ username })
  }

  async userExists(username: string): Promise<boolean> {
    const count = await this.usersRepo.count({ where: { username } })
    return count > 0
  }

  async insertUser(dto: CreateUserDto): Promise<Users> {
    const { username, password, admin = false } = dto
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = this.usersRepo.create({ username, password: hashedPassword, admin })
    return this.usersRepo.save(user)
  }
}
