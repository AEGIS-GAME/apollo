import { DataSource } from "typeorm"
import * as dotenv from "dotenv"

dotenv.config()

const isProd = process.env.NODE_ENV === "production"

export default new DataSource(
  isProd
    ? {
        type: "postgres" as const,
        url: process.env.DATABASE_URL,
        entities: ["src/**/*.entity{.ts,.js}"],
        migrations: ["src/db/migrations/*{.ts,.js}"],
      }
    : {
        type: "sqlite" as const,
        database: "dev.db",
        entities: ["src/**/*.entity{.ts,.js}"],
        migrations: ["src/db/migrations/*{.ts,.js}"],
      }
)
