import * as path from 'path'
import { promises as fs } from 'fs'
import { createDb } from '../src/db/db';
import { Migrator, FileMigrationProvider } from 'kysely';

async function migrate() {
  const db = createDb()

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      path,
      fs,
      migrationFolder: path.join(__dirname, '../src/db/migrations/'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach(it => {
    if (it.status === 'Success') {
      console.log(`Migration "${it.migrationName}" executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`Failed migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error(error);
    process.exit(1);
  }
  await db.destroy();
}

migrate();
