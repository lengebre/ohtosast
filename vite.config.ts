import react from '@vitejs/plugin-react';
import { env } from 'node:process';
import { defineConfig } from 'vite';

/**
 * Project Pages URL: https://<user>.github.io/<repo>/
 * GitHub Actions sets GITHUB_REPOSITORY. For a local Pages test build:
 *   GITHUB_PAGES=true GITHUB_REPOSITORY=you/repo npm run build
 */
function pagesBase(): string {
  if (env.GITHUB_PAGES !== 'true') return '/';
  const repo = env.GITHUB_REPOSITORY?.split('/')[1];
  if (repo) return `/${repo}/`;
  return '/';
}

export default defineConfig({
  plugins: [react()],
  base: pagesBase(),
});
