import path from "node:path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Safety: Prisma CLI commands (db push, studio, ...) target the LOCAL dev database by default.
// Pointing them at the production Neon database is an explicit opt-in:
//   DB_TARGET=production npx prisma db push
if (process.env.DB_TARGET !== "production") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.development.local") });
}
// Load .env.local (Next.js convention). Variables already set above are not overridden.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("POSTGRES_URL_NON_POOLING"),
  },
});
