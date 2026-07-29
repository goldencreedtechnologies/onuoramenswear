import { spawn } from "node:child_process";
import path from "node:path";
import { createRequire } from "node:module";

const projectRoot = process.cwd();
const require = createRequire(path.join(projectRoot, "package.json"));
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(projectRoot);

const databaseUrl =
  process.env.ONUORAMENSWEAR_POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.ONUORAMENSWEAR_POSTGRES_PRISMA_URL;
const operation = process.argv[2];

if (!databaseUrl) {
  throw new Error("A pooled PostgreSQL connection URL is required.");
}

if (operation !== "list" && operation !== "push") {
  throw new Error("Use `node scripts/supabase-db.mjs list` or `node scripts/supabase-db.mjs push`.");
}

const args =
  operation === "list"
    ? ["supabase", "migration", "list", "--db-url", databaseUrl]
    : ["supabase", "db", "push", "--db-url", databaseUrl];

const npxCli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js");
const child = spawn(process.execPath, [npxCli, ...args], {
  cwd: projectRoot,
  env: process.env,
  shell: false,
  stdio: "inherit"
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
