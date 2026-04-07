import { spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const env = {
  ...process.env,
  VITE_BASE_PATH: "/quant-pulse/",
  PLAYWRIGHT_BASE_URL: "http://127.0.0.1:4174/quant-pulse/",
  PLAYWRIGHT_WEB_SERVER_URL: "http://127.0.0.1:4174/quant-pulse/",
  PLAYWRIGHT_WEB_SERVER_COMMAND: `${npmCommand} run dev -- --host 127.0.0.1 --port 4174`,
};

const result = spawnSync(`${npmCommand} run test:e2e`, {
  stdio: "inherit",
  env,
  shell: true,
});

process.exit(result.status ?? 1);
