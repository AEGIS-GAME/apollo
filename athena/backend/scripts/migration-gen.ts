#!/usr/bin/env ts-node
import { execSync } from "child_process";

const name = process.argv[2];

if (!name) {
  console.error("Usage: ts-node scripts/migration-gen.ts <MigrationName>");
  process.exit(1);
}

execSync(`npx typeorm-ts-node-commonjs migration:generate ./src/db/migrations/${name} -d src/db/data-source.ts`, {
  stdio: "inherit",
});
