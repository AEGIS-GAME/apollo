import path from "path";
import { promises as fs } from "fs";
import { FileMigrationProvider, Migrator } from "kysely";
import { createDb } from '../src/db/db';

async function rollback() {
  const db = createDb();

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, '../src/db/migrations/'),
    }),
  });

  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`Rolled back migration "${it.migrationName}"`);
    } else if (it.status === "Error") {
      console.error(`Failed to rollback "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

rollback();
