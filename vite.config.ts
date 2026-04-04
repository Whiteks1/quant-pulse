import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";

function normalizeBase(p: string): string {
  if (!p || p === "/") return "/";
  const withLeading = p.startsWith("/") ? p : `/${p}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

/** Inyecta og:image en build cuando VITE_OG_IMAGE_URL está definida (p. ej. CI de GitHub Pages). */
function injectOgImage(): Plugin {
  return {
    name: "inject-og-image",
    transformIndexHtml(html) {
      const og = process.env.VITE_OG_IMAGE_URL?.trim();
      if (og) {
        return html.replace("__OG_IMAGE__", og);
      }
      return html.replace(/\s*<meta property="og:image" content="__OG_IMAGE__" \/>\s*\n?/, "\n");
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: normalizeBase(process.env.VITE_BASE_PATH || "/"),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), injectOgImage()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
});
