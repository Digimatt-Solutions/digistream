// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Allow Netlify (or any external CI) to override the Nitro preset via NITRO_PRESET.
// On Netlify, netlify.toml sets NITRO_PRESET=netlify so Nitro emits Netlify Functions
// + a static `dist` directory. Inside the Lovable editor the preset is forced to
// Cloudflare, so this override is a no-op there.
const nitroPreset = process.env.NITRO_PRESET;

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  ...(nitroPreset ? { nitro: { preset: nitroPreset } } : {}),
});
