/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

// Injected at build time by the `define` block in vite.config.ts from
// package.json's version. Displayed in Settings and the update prompt.
declare const __APP_VERSION__: string;
