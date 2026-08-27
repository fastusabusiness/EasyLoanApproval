// Derives a SQLite version of schema.prisma for local development, so the
// committed schema can stay on PostgreSQL for deployment. The output file
// (prisma/schema.local.prisma) is gitignored — regenerate it any time with
// the db:push or db:studio npm scripts.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "prisma/schema.prisma"), "utf8");

if (!source.includes('provider = "postgresql"')) {
  console.error("Expected schema.prisma datasource provider to be postgresql.");
  process.exit(1);
}

const local =
  "// GENERATED from schema.prisma by scripts/local-schema.mjs — do not edit.\n\n" +
  source.replace('provider = "postgresql"', 'provider = "sqlite"');

writeFileSync(join(root, "prisma/schema.local.prisma"), local);
console.log("Wrote prisma/schema.local.prisma (sqlite for local dev)");
