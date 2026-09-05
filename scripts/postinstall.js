/**
 * Root postinstall. Runs `prisma generate` when Prisma is installed (local dev,
 * CI, Render API) but skips silently on builds that don't have it (e.g. the
 * Vercel frontend installs only web-side deps). Never fails the install.
 */
const { spawnSync } = require("child_process");

try {
  require.resolve("prisma/package.json");
} catch {
  process.exit(0);
}

const res = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["prisma", "generate", "--schema", "apps/api/prisma/schema.prisma"],
  { stdio: "inherit", shell: true },
);

process.exit(res.status ?? 0);