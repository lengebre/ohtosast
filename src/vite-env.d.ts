/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full repo URL, e.g. https://github.com/org/repo (no trailing slash) */
  readonly VITE_GITHUB_REPO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.html?raw' {
  const src: string;
  export default src;
}
