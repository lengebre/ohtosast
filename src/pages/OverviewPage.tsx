import type { PanelId } from '../types';

type Props = {
  onNavigate: (panel: PanelId) => void;
};

export function OverviewPage({ onNavigate }: Props) {
  return (
    <div className="panel active">
      <section className="hero">
        <div className="hero-eyebrow">Keeping Infrastructure as Code Secure</div>
        <h1>
          AWS KMS &amp; IAM
          <br />
          <em>Security Findings</em>
          <br />
          Reference
        </h1>
        <p className="hero-desc">
          This site explains how KICS and Checkov flag risky AWS KMS and IAM settings in Terraform. For each check you
          will see what pattern triggers it, why it is a problem, and how to fix it in code.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num r">9</span>
            <span className="hero-stat-label">Critical checks</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num a">2</span>
            <span className="hero-stat-label">High checks</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num g">14</span>
            <span className="hero-stat-label">Total checks covered</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num" style={{ color: 'var(--blue)' }}>
              4
            </span>
            <span className="hero-stat-label">Resource types</span>
          </div>
        </div>
      </section>

      <div className="overview-grid">
        <div className="ov-card red">
          <div className="ov-icon">🔍</div>
          <div className="ov-title">What is KICS?</div>
          <div className="ov-body">
            <strong style={{ color: 'var(--text)' }}>Keeping Infrastructure as Code Secure</strong> (KICS) is an
            open-source scanner from Checkmarx. It reads IaC files (Terraform, CloudFormation, Kubernetes, Ansible,
            and others) and reports security misconfigurations before you deploy.
            <br />
            <br />
            Checkov (Bridgecrew / Prisma Cloud) uses many of the same rule IDs. Teams often run one or both in CI/CD to
            enforce policy as code.
          </div>
        </div>
        <div className="ov-card amber">
          <div className="ov-icon">⚡</div>
          <div className="ov-title">How does it scan?</div>
          <div className="ov-body">
            KICS only reads your <code>.tf</code> files on disk. It does not call the AWS APIs and does not need a{' '}
            <code>terraform plan</code>. It matches resources against a library of rules and reports anything that
            looks unsafe.
            <br />
            <br />
            That means you get feedback while you are still authoring code. In GitLab, a typical setup runs KICS as a
            SAST job on every merge request.
          </div>
        </div>
        <div className="ov-card teal">
          <div className="ov-icon">🏦</div>
          <div className="ov-title">Why it matters for financial services</div>
          <div className="ov-body">
            Weak KMS or IAM settings show up often in cloud audits. Many rules line up with common compliance
            expectations, for example:
            <br />
            <br />
            <strong style={{ color: 'var(--text)' }}>PCI-DSS 3.6.4</strong> (key rotation){' · '}
            <strong style={{ color: 'var(--text)' }}>CIS AWS 1.16</strong> (avoid admin wildcards){' · '}
            <strong style={{ color: 'var(--text)' }}>SOC 2 CC6.3</strong> (least privilege){' · '}
            <strong style={{ color: 'var(--text)' }}>PCI-DSS 7.1.2</strong> (limit access to need-to-know)
          </div>
        </div>
      </div>

      <section className="flow-section">
        <div className="section-label">How KICS fits into a CI/CD pipeline</div>
        <div className="flow-steps">
          <div className="flow-step">
            <div className="fs-num">01 / AUTHOR</div>
            <div className="fs-title">Write Terraform</div>
            <div className="fs-body">
              A developer changes <code>.tf</code> files and opens a merge request to the main branch.
            </div>
          </div>
          <div className="flow-step">
            <div className="fs-num">02 / SCAN</div>
            <div className="fs-title">KICS SAST job</div>
            <div className="fs-body">
              GitLab CI runs something like <code>kics scan -p . --report-formats json</code> on the repo. No AWS
              credentials are required for this step.
            </div>
          </div>
          <div className="flow-step">
            <div className="fs-num">03 / GATE</div>
            <div className="fs-title">Block or warn</div>
            <div className="fs-body">
              Critical issues usually block merging. High issues may be warnings. Results show up in the GitLab
              Security Dashboard.
            </div>
          </div>
          <div className="flow-step">
            <div className="fs-num">04 / FIX</div>
            <div className="fs-title">Remediate &amp; re-scan</div>
            <div className="fs-body">
              The developer applies the fix, pushes a new commit, and the pipeline runs again automatically.
            </div>
          </div>
        </div>
      </section>

      <section className="sev-section">
        <div className="section-label">Severity levels and what they mean</div>
        <table className="sev-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>KICS definition</th>
              <th>Pipeline behaviour</th>
              <th>Example checks covered here</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="sev-pill critical">Critical</span>
              </td>
              <td>
                Serious risk: account takeover, data theft, or privilege escalation with little or no extra setup
                required by an attacker
              </td>
              <td>Merge request blocked until fixed or formally risk-accepted</td>
              <td>
                <code>CKV_AWS_1</code> · <code>CKV_AWS_111</code> · <code>CKV_AWS_107</code> · <code>CKV_AWS_108</code>{' '}
                · <code>CKV_AWS_109</code> · <code>CKV_AWS_110</code> · <code>CKV2_AWS_6</code> · <code>CKV_AWS_356</code>{' '}
                · <code>CKV2_AWS_40</code>
              </td>
            </tr>
            <tr>
              <td>
                <span className="sev-pill high">High</span>
              </td>
              <td>
                Large increase in attack surface or a clear compliance gap, but not always instant full account
                compromise
              </td>
              <td>Warning on the MR; track in backlog; fix within the team&apos;s usual sprint rules</td>
              <td>
                <code>CKV_AWS_7</code> · <code>CKV_AWS_227</code>
              </td>
            </tr>
            <tr>
              <td>
                <span className="sev-pill medium">Medium</span>
              </td>
              <td>Drift from best practice with a smaller or less direct exploit path</td>
              <td>Informational only; does not block merge</td>
              <td>
                <code>CKV_AWS_49</code> (depends on context) · tag / logging checks
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="quicknav">
        <div className="section-label">Navigate to a finding category</div>
        <div className="qn-grid">
          <button type="button" className="qn-card" onClick={() => onNavigate('kms')}>
            <div className="qn-cat">Section 01</div>
            <div className="qn-name">KMS Key Policy</div>
            <div className="qn-desc">
              Rules for <code>aws_kms_key</code> and <code>aws_kms_key_policy</code>: open principals, broad actions,
              missing policies, rotation, and whether the key is enabled.
            </div>
            <div className="qn-badge-row">
              <span className="mini-badge c">CKV_AWS_111</span>
              <span className="mini-badge c">CKV_AWS_356</span>
              <span className="mini-badge c">CKV2_AWS_6</span>
              <span className="mini-badge h">CKV_AWS_7</span>
              <span className="mini-badge h">CKV_AWS_227</span>
            </div>
          </button>
          <button type="button" className="qn-card" onClick={() => onNavigate('iam')}>
            <div className="qn-cat">Section 02</div>
            <div className="qn-name">IAM Policy: KMS Actions</div>
            <div className="qn-desc">
              Rules for <code>aws_iam_policy_document</code> when KMS permissions are too broad. Includes a note on
              known false positives for <code>CKV_AWS_356</code>.
            </div>
            <div className="qn-badge-row">
              <span className="mini-badge c">CKV_AWS_49</span>
              <span className="mini-badge c">CKV_AWS_356</span>
              <span className="mini-badge h">CKV_AWS_111</span>
            </div>
          </button>
          <button type="button" className="qn-card" onClick={() => onNavigate('iamcrit')}>
            <div className="qn-cat">Section 03</div>
            <div className="qn-name">IAM Criticals</div>
            <div className="qn-desc">
              Six severe IAM rules: admin wildcards, credential abuse, data exfiltration paths, permission management,
              privilege escalation, and full IAM control.
            </div>
            <div className="qn-badge-row">
              <span className="mini-badge c">CKV_AWS_1</span>
              <span className="mini-badge c">CKV_AWS_107</span>
              <span className="mini-badge c">CKV_AWS_108</span>
              <span className="mini-badge c">CKV_AWS_109</span>
              <span className="mini-badge n">+2 more</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
