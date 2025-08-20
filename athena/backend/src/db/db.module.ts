import { Module } from "@nestjs/common"
import { createDb } from "./db";

@Module({
  providers: [
    {
      provide: "DB",
      useValue: createDb()
    },
  ],
  exports: ["DB"],
})
export class DbModule { }
