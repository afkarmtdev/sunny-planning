import { transformAsync } from "@babel/core";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * @vitejs/plugin-react v6 is oxc-based and no longer runs Babel, so StyleX's
 * compile step gets its own pre-transform. CSS extraction is handled by
 * @stylexjs/postcss-plugin (see postcss.config.cjs / babel.config.cjs).
 */
function stylexBabel(mode: string): Plugin {
  return {
    name: "stylex-babel",
    enforce: "pre",
    async transform(code, id) {
      const file = id.split("?")[0];
      if (!/\.[jt]sx?$/.test(file) || file.includes("node_modules")) return null;
      if (!code.includes("@stylexjs/stylex")) return null;
      const result = await transformAsync(code, {
        filename: file,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        parserOpts: { plugins: ["jsx"] },
        presets: [["@babel/preset-typescript", { isTSX: true, allExtensions: true }]],
        plugins: [
          [
            "@stylexjs/babel-plugin",
            {
              dev: mode === "development",
              runtimeInjection: false,
              treeshakeCompensation: true,
              unstable_moduleResolution: { type: "commonJS" },
            },
          ],
        ],
      });
      if (!result?.code) return null;
      return { code: result.code, map: result.map };
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    port: 5180,
  },
  plugins: [
    stylexBabel(mode),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["sunny.png"],
      manifest: {
        name: "Sunny Planning",
        short_name: "Sunny",
        description: "Couples' date planner with Sunny the pixel cat",
        theme_color: "#FFD3E8",
        background_color: "#FFF9F0",
        display: "standalone",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,woff2}"],
      },
    }),
  ],
}));
