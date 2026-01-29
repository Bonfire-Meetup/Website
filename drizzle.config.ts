import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const url = process.env.BNF_NEON_DATABASE_URL;
if (!url) {
  throw new Error("BNF_NEON_DATABASE_URL is not set");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/lib/data/schema.ts",
  out: "./db/drizzle/migrations",
  migrations: { table: "__drizzle_migrations", schema: "public" },
  dbCredentials: { url },
});
