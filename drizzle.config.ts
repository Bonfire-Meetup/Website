import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/lib/data/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.BNF_NEON_DATABASE_URL!,
  },
});
