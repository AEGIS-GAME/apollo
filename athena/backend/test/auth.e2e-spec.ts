import * as bcrypt from "bcrypt"
import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import request from "supertest"
import { DataSource } from "typeorm"
import { Users } from "../src/users/entities/users.entity"
import { TestAppModule } from "./app.module"
import { Server } from "http"

describe("AuthController (e2e)", () => {
  let app: INestApplication<Server>
  let dataSource: DataSource

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()

    dataSource = app.get(DataSource)
  })

  beforeEach(async () => {
    await dataSource.getRepository(Users).clear()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("/auth/register", () => {
    it("(POST) - success", async () => {
      const payload = { username: "testuser", password: "12345678" }

      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send(payload)
        .expect(201)

      expect(res.body).toHaveProperty("access")
      expect(res.body).toHaveProperty("refresh")
    })

    it("(POST) - username taken", async () => {
      const payload = { username: "testuser", password: "12345678" }

      await dataSource.getRepository(Users).save({
        username: payload.username,
        password: await bcrypt.hash(payload.password, 10),
        admin: false,
      })

      await request(app.getHttpServer())
        .post("/auth/register")
        .send(payload)
        .expect(409)
    })
  })

  describe("/auth/login", () => {
    it("(POST) - success", async () => {
      const password = "12345678"
      const hashed = await bcrypt.hash(password, 10)

      await dataSource.getRepository(Users).save({
        username: "testuser",
        password: hashed,
        admin: false,
      })

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ username: "testuser", password })
        .expect(201)

      expect(response.body).toHaveProperty("access")
      expect(response.body).toHaveProperty("refresh")
    })

    it("(POST) - invalid credentials", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ username: "wronguser", password: "123456789" })
        .expect(401)
    })
  })
})
