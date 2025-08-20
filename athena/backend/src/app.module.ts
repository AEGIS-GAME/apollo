import { Module } from "@nestjs/common"
import { AuthModule } from "./auth/auth.module"
import { ConfigModule } from "@nestjs/config"
import { UsersModule } from "./users/users.module"
import { TypeOrmModule } from "@nestjs/typeorm"

const isProd = process.env.NODE_ENV === "production"

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ cache: true }),
    TypeOrmModule.forRoot({
      type: isProd ? "postgres" : "sqlite",
      database: isProd ? undefined : "dev.db",
      url: isProd ? process.env.DATABASE_URL : undefined,
      synchronize: !isProd,
      autoLoadEntities: true,
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
