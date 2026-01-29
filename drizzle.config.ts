import { defineConfig } from "drizzle-kit";

const url = process.env.BNF_NEON_MIGRATION_DATABASE_URL ?? process.env.BNF_NEON_DATABASE_URL;

if (!url) {
  throw new Error(
    "Database URL missing: set BNF_NEON_MIGRATION_DATABASE_URL (preferred) or BNF_NEON_DATABASE_URL",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/lib/data/schema.ts",
  out: "./db/drizzle/migrations",
  migrations: { table: "__drizzle_migrations", schema: "public" },
  dbCredentials: { url },
});
