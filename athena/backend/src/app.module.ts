import { Module } from "@nestjs/common"
import { UserController } from "./users/users.controller"
import { DbModule } from "./db/db.module"
import { UsersService } from "./users/users.service"
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [DbModule, AuthModule, ConfigModule.forRoot({ cache: true })],
  controllers: [UserController],
  providers: [UsersService],
})
export class AppModule { }
