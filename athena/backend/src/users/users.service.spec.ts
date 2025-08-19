import { ConflictException } from "@nestjs/common";
import { UsersService } from "./users.service"
import * as bcrypt from 'bcrypt';

describe("UsersService", () => {
  let service: UsersService;
  let fakeDb: any;

  beforeEach(() => {
    const selectMock: any = { executeTakeFirst: jest.fn().mockResolvedValue(null) };
    selectMock.select = jest.fn().mockReturnValue(selectMock);
    selectMock.where = jest.fn().mockReturnValue(selectMock);

    const insertMock = { values: jest.fn().mockReturnThis(), returningAll: jest.fn().mockReturnThis(), executeTakeFirst: jest.fn().mockResolvedValue({ id: 1, username: 'test' }) };

    fakeDb = {
      selectFrom: jest.fn().mockReturnValue(selectMock),
      insertInto: jest.fn().mockReturnValue(insertMock),
    };

    service = new UsersService(fakeDb);
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should hash password when creating user", async () => {
    const user = await service.create("test", "password")

    const insertedValues = fakeDb.insertInto().values.mock.calls[0][0]
    const match = await bcrypt.compare("password", insertedValues.password_hash)

    expect(user.id).toBe(1)
    expect(match).toBe(true)
    expect(fakeDb.insertInto().values).toHaveBeenCalledWith(
      expect.objectContaining({ password_hash: expect.any(String) })
    )
  })

  it('should throw on duplicate username', async () => {
    fakeDb.selectFrom().select().where().executeTakeFirst.mockResolvedValue({ id: 1 });

    await expect(service.create('test', 'password')).rejects.toThrow(ConflictException);
  });
})
