// Electron main process for the Internship Tracker desktop wrapper.
//
// On launch this spawns the already-built Next.js production server as a
// child process (using Electron's own bundled Node via
// ELECTRON_RUN_AS_NODE, so no separate Node install is required), points
// the database at a file under this app's userData directory (never
// inside the read-only app bundle), applies any pending Prisma migrations,
// and only then loads the app into the window. The child server is killed
// when the app quits.

const { app, BrowserWindow, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const net = require("node:net");
const http = require("node:http");
const { spawn } = require("node:child_process");

const projectRoot = app.isPackaged
  ? path.join(process.resourcesPath, "app")
  : path.join(__dirname, "..");

const userDataDir = app.getPath("userData");
const dbPath = path.join(userDataDir, "dev.db");
const databaseUrl = `file:${dbPath}`;
const logPath = path.join(userDataDir, "internship-tracker.log");

let serverProcess = null;

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}\n`;
  try {
    fs.appendFileSync(logPath, stamped);
  } catch {
    // Logging is best-effort — never let a log write crash startup.
  }
  console.log(line);
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function runChild(scriptPath, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: projectRoot,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", ...env },
    });
    let stderr = "";
    child.stdout?.on("data", (d) => log(`[migrate] ${d.toString().trim()}`));
    child.stderr?.on("data", (d) => {
      stderr += d.toString();
      log(`[migrate:err] ${d.toString().trim()}`);
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptPath} exited with code ${code}: ${stderr}`));
    });
  });
}

async function ensureDatabaseMigrated() {
  fs.mkdirSync(userDataDir, { recursive: true });
  const prismaCli = path.join(projectRoot, "node_modules", "prisma", "build", "index.js");
  await runChild(prismaCli, ["migrate", "deploy"], { DATABASE_URL: databaseUrl });
}

function startNextServer(port) {
  const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
  serverProcess = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: projectRoot,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      DATABASE_URL: databaseUrl,
      NODE_ENV: "production",
      PORT: String(port),
    },
  });
  serverProcess.stdout?.on("data", (d) => log(`[next] ${d.toString().trim()}`));
  serverProcess.stderr?.on("data", (d) => log(`[next:err] ${d.toString().trim()}`));
  serverProcess.on("exit", (code) => {
    log(`Next server exited with code ${code}`);
    serverProcess = null;
  });
}

function waitForServer(port, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    function attempt() {
      const req = http.get({ host: "127.0.0.1", port, path: "/", timeout: 1500 }, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() > deadline) {
          reject(new Error("Timed out waiting for the local server to start."));
        } else {
          setTimeout(attempt, 300);
        }
      });
      req.on("timeout", () => req.destroy());
    }
    attempt();
  });
}

const LOADING_HTML = `data:text/html,${encodeURIComponent(`
  <html><body style="margin:0;height:100vh;display:flex;align-items:center;
  justify-content:center;background:#0b1120;color:#e2e8f0;
  font-family:-apple-system,sans-serif;">
    <p>🚀 Starting Internship Tracker…</p>
  </body></html>
`)}`;

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: "Internship Tracker",
    backgroundColor: "#0b1120",
    webPreferences: { contextIsolation: true },
  });
  win.loadURL(LOADING_HTML);

  try {
    const port = await getFreePort();
    log(`Using port ${port}, database at ${dbPath}`);
    await ensureDatabaseMigrated();
    startNextServer(port);
    await waitForServer(port);
    await win.loadURL(`http://127.0.0.1:${port}`);
  } catch (err) {
    log(`Startup failed: ${err.stack || err}`);
    dialog.showErrorBox(
      "Internship Tracker failed to start",
      `${err.message}\n\nDetails were written to:\n${logPath}`,
    );
    app.quit();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
