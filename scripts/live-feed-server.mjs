import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveLiveFeedRequest } from "./live-feed-backend.mjs";

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
}

export function createLiveFeedServer() {
  return http.createServer((req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, {
        Allow: "GET",
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(
        `${JSON.stringify({ error: { code: "method_not_allowed", message: "Only GET is supported." } }, null, 2)}\n`
      );
      return;
    }

    const requestUrl = new URL(req.url ?? "/", "http://localhost");
    const result = resolveLiveFeedRequest(requestUrl.pathname);
    jsonResponse(res, result.status, result.body);
  });
}

export function startLiveFeedServer({ port = 8787, host = "127.0.0.1" } = {}) {
  const server = createLiveFeedServer();
  server.listen(port, host, () => {
    console.log(`Quant Pulse live feed server listening on http://${host}:${port}`);
  });
  return server;
}

const currentFilePath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (invokedPath && currentFilePath === invokedPath) {
  const port = Number.parseInt(process.env.PORT ?? "8787", 10);
  const host = process.env.HOST ?? "127.0.0.1";
  startLiveFeedServer({
    port: Number.isFinite(port) ? port : 8787,
    host,
  });
}
