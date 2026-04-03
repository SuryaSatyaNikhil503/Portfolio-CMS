import path from "node:path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local (Next.js convention) instead of just .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("POSTGRES_PRISMA_URL"),
    directUrl: env("POSTGRES_URL_NON_POOLING"),
  },
});
