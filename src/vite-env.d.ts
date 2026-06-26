/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Injected at build time via vite.config.ts → define
declare const __KJ_BUILD_VERSION__: string;
