import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { TestAppModule } from './app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/auth/register (POST) - success', async () => {
    const payload = { username: 'testuser', password: '12345678' }

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201)

    expect(res.body).toHaveProperty('access')
    expect(res.body).toHaveProperty('refresh')
  })

  it('/auth/register (POST) - username taken', async () => {
    const payload = { username: 'testuser', password: '12345678' }

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(409)
  })
})
