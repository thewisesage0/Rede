import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Plain, provider-agnostic Vite config (no Lovable, no Cloudflare).
//
// Deployment target selection is handled entirely by Nitro:
// - On Vercel, Nitro auto-detects the Vercel build environment and produces
//   Vercel Functions automatically — no extra config or vercel.json needed.
// - Locally, `vite dev` / `vite build` + `vite preview` work the same way.
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    // autoCodeSplitting: each route (page) becomes its own chunk instead of
    // one giant bundle. This matters a lot here: the AE-only admin pages
    // pull in recharts and the xlsx export library, which authors and
    // first-time visitors never need to download.
    tanstackStart({ router: { autoCodeSplitting: true } }),
    nitro(),
    viteReact(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
