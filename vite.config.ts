import react from '@vitejs/plugin-react';
import { env } from 'node:process';
import { defineConfig } from 'vite';

/**
 * Vite `base` must match where the site is hosted.
 *
 * - Custom domain (or user/org site at domain root): PAGES_BASE=/
 * - Project Pages default URL: https://<user>.github.io/<repo>/ → omit PAGES_BASE; uses repo name
 *
 * Set PAGES_BASE in GitHub: Settings → Secrets and variables → Actions → Variables (e.g. `/`).
 * Or in the workflow env for this job.
 */
function normalizeBasePath(raw: string | undefined): string | undefined {
  if (raw == null) return undefined;
  const t = raw.trim();
  if (t === '') return undefined;
  const withLeading = t.startsWith('/') ? t : `/${t}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

function pagesBase(): string {
  const explicit = normalizeBasePath(env.PAGES_BASE);
  if (explicit) return explicit;

  if (env.GITHUB_PAGES !== 'true') return '/';

  const repo = env.GITHUB_REPOSITORY?.split('/')[1];
  if (repo) return `/${repo}/`;
  return '/';
}

export default defineConfig({
  plugins: [react()],
  base: pagesBase(),
});
