import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProd = process.env.NODE_ENV === "production"

        return {
          type: isProd ? "postgres" : "sqlite",
          database: isProd ? undefined : "dev.db",
          url: isProd ? process.env.DATABASE_URL : undefined,
          migrations: [__dirname + "/db/migrations/*{.ts,.js}"],
          cli: {
            migrationsDir: "src/db/migrations",
          },
          synchronize: !isProd,
          autoLoadEntities: true,
        }
      },
    }),
  ],
})
export class DbModule {}
