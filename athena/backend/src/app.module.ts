import { Module } from "@nestjs/common"
import { UserController } from "./users/users.controller"
import { DbModule } from "./db/db.module"
import { UsersService } from "./users/users.service"

@Module({
  imports: [DbModule],
  controllers: [UserController],
  providers: [UsersService],
})
export class AppModule {}
