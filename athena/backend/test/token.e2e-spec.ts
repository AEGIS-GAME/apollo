import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import request from "supertest"
import { DataSource } from "typeorm"
import { Users } from "../src/users/entities/users.entity"
import { TokenService } from "../src/token/token.service"
import { TestAppModule } from "./app.module"
import { Server } from "http"

describe("TokenController (e2e)", () => {
  let app: INestApplication<Server>
  let service: TokenService
  let dataSource: DataSource

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
      providers: [TokenService],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()

    dataSource = app.get(DataSource)
    service = app.get(TokenService)
  })

  beforeEach(async () => {
    await dataSource.getRepository(Users).clear()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("/token/refresh", () => {
    it("(POST) - should return a new access token", async () => {
      const mockUser = {
        username: "testuser",
        password: "1234567890",
      }

      await request(app.getHttpServer())
        .post("/auth/register")
        .send(mockUser)
        .expect(201)

      const loginRes = await request(app.getHttpServer())
        .post("/auth/login")
        .send(mockUser)
        .expect(201)

      const accessToken = loginRes.body.access

      const res = await request(app.getHttpServer())
        .post("/token/refresh")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(201)

      expect(res.body).toHaveProperty("access")
      expect(typeof res.body.access).toBe("string")

      const decoded = service["jwtService"].decode(res.body.access)
      expect(decoded).toHaveProperty("sub")
      expect(decoded).toHaveProperty("iat")
      expect(decoded).toHaveProperty("exp")
      expect(decoded.sub).toBeDefined()
    })
  })

  describe("/token/validate", () => {
    it("(POST) - should return 204 for valid token", async () => {
      const registerRes = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ username: "validateuser", password: "password123" })
        .expect(201)

      const accessToken = registerRes.body.access

      await request(app.getHttpServer())
        .post("/token/validate")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204)
    })
  })
})
