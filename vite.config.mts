import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react-swc";
import eslint from "vite-plugin-eslint";
import Pages from "vite-plugin-pages";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig((env) => {
  const envars = loadEnv(env.mode, "./");
  const serverURL = new URL(envars.VITE_SERVER_URL ?? "<http://localhost:25000>");
  const serverAPIPath = envars.VITE_SERVER_API_PATH ?? "/api/v1";

  return {
    root: "./src",
    envDir: "../",
    plugins: [
      react(),
      eslint(),
      Pages({
        pagesDir: [{ dir: "pages", baseRoute: "" }],
        extensions: ["tsx"],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        [serverAPIPath]: {
          target: serverURL.origin,
          // rewrite: (path) => path.replace(/^\/api\/v1/, ""),
        },
      },
    },
    build: {
      outDir: "../.local/vite/dist",
      assetsDir: "assets",
      sourcemap: true,
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
          },
        },
      },
    },
  };
});
