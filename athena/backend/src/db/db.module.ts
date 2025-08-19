import { Module } from "@nestjs/common"
import { Kysely, SqliteDialect } from "kysely"
import { DB } from "./types"
import Database from "better-sqlite3"

@Module({
  providers: [
    {
      provide: "DB",
      useValue: new Kysely<DB>({
        dialect: new SqliteDialect({ database: new Database("dev.db") }),
      }),
    },
  ],
  exports: ["DB"],
})
export class DbModule {}
