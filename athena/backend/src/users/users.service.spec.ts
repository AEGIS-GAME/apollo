import { Test, TestingModule } from "@nestjs/testing"
import { UsersService } from "./users.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Users } from "./entities/users.entity"

describe("UsersService", () => {
  let service: UsersService
  let usersRepo: jest.Mocked<Repository<Users>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    usersRepo = module.get(getRepositoryToken(Users))
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
