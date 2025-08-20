import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUsers1755660485968 implements MigrationInterface {
  name = "CreateUsers1755660485968"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "admin" boolean NOT NULL DEFAULT (0), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
