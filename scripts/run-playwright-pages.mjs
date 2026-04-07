import { spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const port = process.env.PLAYWRIGHT_PAGES_PORT ?? "4176";
const env = {
  ...process.env,
  VITE_BASE_PATH: "/quant-pulse/",
  PLAYWRIGHT_BASE_URL: `http://127.0.0.1:${port}/quant-pulse/`,
  PLAYWRIGHT_WEB_SERVER_URL: `http://127.0.0.1:${port}/quant-pulse/`,
  PLAYWRIGHT_WEB_SERVER_COMMAND: `${npmCommand} run dev -- --host 127.0.0.1 --port ${port}`,
  PLAYWRIGHT_REUSE_EXISTING_SERVER: "false",
};

const result = spawnSync(`${npmCommand} run test:e2e`, {
  stdio: "inherit",
  env,
  shell: true,
});

process.exit(result.status ?? 1);
