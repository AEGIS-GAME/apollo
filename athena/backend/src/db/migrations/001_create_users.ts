import { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable("users")
    .addColumn("id", "integer", col => col.primaryKey().autoIncrement())
    .addColumn("username", "text", col => col.notNull())
    .addColumn("password", "text", col => col.notNull())
    .addColumn("is_admin", "boolean", col => col.notNull().defaultTo(false))
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable("users").execute()
}
