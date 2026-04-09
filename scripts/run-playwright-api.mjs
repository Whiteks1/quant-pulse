import { spawn, spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const apiPort = process.env.PLAYWRIGHT_API_PORT ?? "8787";
const appPort = process.env.PLAYWRIGHT_APP_PORT ?? "8080";
const basePath = process.env.VITE_BASE_PATH ?? "/";
const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;
const appBaseUrl = `http://127.0.0.1:${appPort}${normalizedBasePath === "/" ? "/" : normalizedBasePath}`;
const forwardedArgs = process.argv.slice(2);

const apiServer = spawn(
  process.execPath,
  ["scripts/live-feed-server.mjs"],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: apiPort,
      HOST: "127.0.0.1",
    },
    stdio: "inherit",
  }
);

const cleanup = () => {
  if (!apiServer.killed) {
    apiServer.kill();
  }
};

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(143);
});

const env = {
  ...process.env,
  VITE_LIVE_FEED_ORIGIN: `http://127.0.0.1:${apiPort}`,
  PLAYWRIGHT_BASE_URL: appBaseUrl,
  PLAYWRIGHT_WEB_SERVER_URL: appBaseUrl,
  PLAYWRIGHT_WEB_SERVER_COMMAND: `${npmCommand} run dev -- --host 127.0.0.1 --port ${appPort}`,
  PLAYWRIGHT_REUSE_EXISTING_SERVER: "false",
};

if (basePath !== "/") {
  env.VITE_BASE_PATH = normalizedBasePath;
}

const quotedArgs = forwardedArgs.map((arg) => `"${arg.replace(/"/g, '\\"')}"`).join(" ");
const result = spawnSync(
  `${npmCommand} run test:e2e${quotedArgs ? ` -- ${quotedArgs}` : ""}`,
  {
    stdio: "inherit",
    env,
    shell: true,
  }
);

cleanup();
process.exit(result.status ?? 1);
