import { githubNewIssueUrl, githubRepoUrl } from '../config/github';
import { useTheme } from '../context/ThemeContext';
import type { PanelId } from '../types';
import { cn } from '../utils/cn';

const NAV: { id: PanelId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'pipeline', label: 'GitLab CI Pipeline' },
  { id: 'kms', label: 'KMS Key Policy' },
  { id: 'iam', label: 'IAM / KMS Actions' },
  { id: 'iamcrit', label: 'IAM Criticals' },
  { id: 'summary', label: 'All-Passing Template' },
];

type Props = {
  active: PanelId;
  onNavigate: (panel: PanelId) => void;
};

export function TopNav({ active, onNavigate }: Props) {
  const { theme, toggleTheme } = useTheme();
  const nextLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <nav className="topnav" aria-label="Primary">
      <div className="topnav-brand">
        <span className="dot" aria-hidden />
        KICS Security Reference
      </div>
      <div className="topnav-links">
        {NAV.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={cn('topnav-link', active === id && 'active')}
            onClick={() => onNavigate(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="topnav-end">
        <div className="topnav-github" role="group" aria-label="Repository on GitHub">
          <a
            className="topnav-gh-link"
            href={githubNewIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Report an issue on GitHub"
            title="Report a bug or suggest an improvement (opens GitHub)"
          >
            <span className="topnav-gh-text">Issue</span>
          </a>
          <a
            className="topnav-gh-link"
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open repository on GitHub to star it"
            title="Open the repository on GitHub to star it"
          >
            <span className="topnav-gh-text">Star</span>
          </a>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={nextLabel}
          title={nextLabel}
        >
          <span className="theme-toggle-icon" aria-hidden>
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
          <span className="theme-toggle-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
        <span className="topnav-tag">Terraform · AWS</span>
      </div>
    </nav>
  );
}
