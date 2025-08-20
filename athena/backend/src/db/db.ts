import { Kysely, SqliteDialect } from "kysely";
import { DB } from "./types";
import Database from "better-sqlite3";

export function createDb(): Kysely<DB> {
  return new Kysely<DB>({
    dialect: new SqliteDialect({
      database: new Database("dev.db"),
    }),
  });
}
