import { Kysely } from "kysely";
import * as bcrypt from "bcrypt";

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable("users")
    .addColumn("id", "integer", col => col.primaryKey().autoIncrement())
    .addColumn("username", "text", col => col.notNull())
    .addColumn("password_hash", "text", col => col.notNull())
    .addColumn("admin", "boolean", col => col.notNull().defaultTo(false))
    .execute()

  const hashedPassword = await bcrypt.hash("1234567890", 10);

  await db
    .insertInto("users")
    .values({
      username: "test",
      password_hash: hashedPassword,
    })
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable("users").execute()
}
