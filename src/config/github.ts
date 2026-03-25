/**
 * Repository for “Report issue” and “Star on GitHub”.
 * Override at build time: VITE_GITHUB_REPO_URL=https://github.com/org/repo
 */
const DEFAULT_REPO = 'https://github.com/mo/ohtosast';

function normalizeRepoUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

const base = normalizeRepoUrl(
  (import.meta.env.VITE_GITHUB_REPO_URL as string | undefined)?.trim() || DEFAULT_REPO,
);

export const githubRepoUrl = base;
export const githubNewIssueUrl = `${base}/issues/new`;
