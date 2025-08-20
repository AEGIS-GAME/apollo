import { TypeOrmModule } from "@nestjs/typeorm"
import { Module } from "@nestjs/common"
import { UsersModule } from "../src/users/users.module"
import { AuthModule } from "../src/auth/auth.module"
import { ConfigModule } from "@nestjs/config"

// Need this module cause dev.db and .env are in .gitignore

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          JWT_ACCESS_SECRET: "test-access",
          JWT_REFRESH_SECRET: "test-refresh",
        }),
      ],
    }),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: ":memory:", // in-memory DB
      synchronize: true,
      autoLoadEntities: true,
      dropSchema: true,
    }),
  ],
})
export class TestAppModule {}
