// electron-builder's "extraResources" applies smart node_modules pruning
// based on the *packaging project's* (this desktop/ folder's) own
// package.json dependency graph — which only lists electron/electron-
// builder, so it silently drops the actual app's node_modules entirely.
// Doing the copy ourselves with plain `cp -R` after packaging sidesteps
// that heuristic completely: what's on disk in the root project is
// exactly what ends up in the app bundle, no dependency analysis involved.

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { rebuild } = require("@electron/rebuild");

const ROOT = path.join(__dirname, "..");

const INCLUDE = [
  "package.json",
  "next.config.ts",
  "prisma7.config.ts",
  "tsconfig.json",
  ".next",
  "node_modules",
  "public",
  "prisma/schema.prisma",
  "prisma/migrations",
  "src/generated",
];

const EXCLUDE_DIR_NAMES = new Set(["cache", ".cache"]);

module.exports = async function afterPack(context) {
  const appName = context.packager.appInfo.productFilename;
  const destRoot = path.join(
    context.appOutDir,
    `${appName}.app`,
    "Contents",
    "Resources",
    "app",
  );
  fs.mkdirSync(destRoot, { recursive: true });

  for (const rel of INCLUDE) {
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(destRoot, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    execFileSync("cp", ["-R", "-P", src, dest]);
  }

  // Strip build caches after copying — cheaper to delete than to teach cp
  // to skip them, and they're never read at runtime.
  for (const name of EXCLUDE_DIR_NAMES) {
    const cacheDir = path.join(destRoot, ".next", name);
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }

  console.log(`[afterPack] copied app resources into ${destRoot}`);

  // The copied node_modules/better-sqlite3 was compiled against the
  // system Node.js used for regular web development — Electron embeds a
  // different V8/ABI, so native addons need a separate rebuild targeting
  // it specifically. This only touches the COPY inside the app bundle;
  // the root project's own node_modules (used by `npm run dev`/`build`)
  // is never modified, so the normal web app keeps working unchanged.
  const electronVersion = require("electron/package.json").version;
  console.log(
    `[afterPack] rebuilding native modules for Electron ${electronVersion}...`,
  );
  await rebuild({
    // Despite the option name, this wants the project ROOT (it reads
    // <buildPath>/package.json), not the node_modules directory itself.
    buildPath: destRoot,
    electronVersion,
    onlyModules: ["better-sqlite3"],
    force: true,
  });
  console.log("[afterPack] native module rebuild complete");
};
