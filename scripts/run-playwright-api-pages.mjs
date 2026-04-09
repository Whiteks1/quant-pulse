import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  VITE_BASE_PATH: "/quant-pulse/",
  PLAYWRIGHT_APP_PORT: process.env.PLAYWRIGHT_APP_PORT ?? "4177",
  PLAYWRIGHT_API_PORT: process.env.PLAYWRIGHT_API_PORT ?? "8788",
};

const forwardedArgs = process.argv.slice(2);
const quotedArgs = forwardedArgs.map((arg) => `"${arg.replace(/"/g, '\\"')}"`).join(" ");
const command = `node scripts/run-playwright-api.mjs${quotedArgs ? ` ${quotedArgs}` : ""}`;

const result = spawnSync(command, {
  stdio: "inherit",
  env,
  shell: true,
});

process.exit(result.status ?? 1);
