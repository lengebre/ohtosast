import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Project Pages URL: https://<user>.github.io/<repo>/
 * CI sets GITHUB_REPOSITORY=owner/repo automatically. For a local Pages test build:
 *   GITHUB_PAGES=true GITHUB_REPOSITORY=you/repo npm run build
 */
function pagesBase(): string {
  if (process.env.GITHUB_PAGES !== 'true') return '/';
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (repo) return `/${repo}/`;
  return '/';
}

export default defineConfig({
  plugins: [react()],
  base: pagesBase(),
});
