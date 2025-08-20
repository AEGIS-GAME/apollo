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
  ) {}

  async getUserByUsername(username: string): Promise<Users | null> {
    return this.usersRepo.findOneBy({ username })
  }

  async userExists(username: string): Promise<boolean> {
    const count = await this.usersRepo.count({ where: { username } })
    return count > 0
  }

  async insertUser(dto: CreateUserDto): Promise<Users> {
    return this.usersRepo.save(
      this.usersRepo.create({ ...dto, admin: dto.admin ?? false })
    )
  }
}
