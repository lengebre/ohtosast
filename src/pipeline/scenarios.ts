export type TermTone = 'w' | 'dim' | 'g' | 'r' | 'a' | 'b';

export type TermLine = readonly [time: string, message: string, tone: TermTone];

export type ReportedFinding = {
  readonly sev: 'C' | 'H' | 'M';
  readonly id: string;
  readonly desc: string;
  readonly file: string;
  readonly line: string;
};

export type GateResult = {
  readonly type: 'blocked' | 'warn-g' | 'clear';
  readonly icon: string;
  readonly title: string;
  readonly body: string;
};

export type PipelineScenario = {
  readonly key: 'critical' | 'high' | 'clean';
  readonly mrTitle: string;
  readonly mrMeta: string;
  readonly branch: string;
  readonly validateLogs: readonly TermLine[];
  readonly validateStatus: 'passed' | 'failed';
  readonly validateDur: string;
  readonly sastLogs: readonly TermLine[];
  readonly sastStatus: 'passed' | 'failed';
  readonly sastDur: string;
  readonly sastFindings: readonly ReportedFinding[];
  readonly planLogs: readonly TermLine[];
  readonly planStatus: 'pending' | 'passed' | 'failed';
  readonly planDur: string;
  readonly gateLogs: readonly TermLine[];
  readonly gateStatus: 'pending' | 'passed' | 'failed';
  readonly gateDur: string;
  readonly gateResult: GateResult | null;
};

export const PIPELINE_SCENARIOS: Record<PipelineScenario['key'], PipelineScenario> = {
  critical: {
    key: 'critical',
    mrTitle: 'feat: add KMS key for app-prod encryption',
    mrMeta: 'mo → main · 3 files changed',
    branch: 'feature/kms-key-app-prod',
    validateLogs: [
      ['00:01', '$ terraform init -backend=false', 'w'],
      ['00:02', 'Initializing provider plugins...', 'dim'],
      ['00:03', '- Finding hashicorp/aws versions matching "~> 5.0"...', 'dim'],
      ['00:04', 'Terraform has been successfully initialized!', 'g'],
      ['00:05', '$ terraform fmt -check -recursive', 'w'],
      ['00:05', 'All files formatted correctly.', 'g'],
      ['00:06', '$ terraform validate', 'w'],
      ['00:07', 'Success! The configuration is valid.', 'g'],
    ],
    validateStatus: 'passed',
    validateDur: '8s',
    sastLogs: [
      ['00:08', '$ kics scan --path . --report-formats json,html --fail-on CRITICAL,HIGH', 'w'],
      ['00:09', 'Scanning Terraform files...', 'dim'],
      ['00:10', 'Found 6 Terraform files to scan', 'dim'],
      ['00:11', 'Running 847 queries against aws/kms, aws/iam...', 'dim'],
      ['00:14', 'Scan complete; writing reports to reports/', 'dim'],
      ['00:14', '', 'dim'],
      ['00:14', 'RESULTS SUMMARY', 'w'],
      ['00:14', '────────────────────────────────────────', 'dim'],
      ['00:14', 'CRITICAL  3   HIGH  1   MEDIUM  0   LOW  0', 'r'],
      ['00:14', '────────────────────────────────────────', 'dim'],
      ['00:15', 'KICS found results with severity CRITICAL', 'r'],
      ['00:15', 'Exit code: 50 (findings detected above threshold)', 'r'],
    ],
    sastStatus: 'failed',
    sastDur: '7s',
    sastFindings: [
      { sev: 'C', id: 'CKV_AWS_111', desc: 'KMS key policy allows wildcard principal', file: 'modules/kms/main.tf', line: '14' },
      { sev: 'C', id: 'CKV_AWS_356', desc: 'KMS key policy uses wildcard action kms:*', file: 'modules/kms/main.tf', line: '18' },
      { sev: 'C', id: 'CKV2_AWS_6', desc: 'No explicit key policy defined on aws_kms_key', file: 'modules/kms/main.tf', line: '4' },
      { sev: 'H', id: 'CKV_AWS_7', desc: 'KMS key rotation not enabled', file: 'modules/kms/main.tf', line: '4' },
    ],
    planLogs: [],
    planStatus: 'pending',
    planDur: '',
    gateLogs: [
      ['00:15', 'Stage skipped (kics-iac-sast failed)', 'r'],
      ['00:15', 'Pipeline blocked at security gate', 'r'],
    ],
    gateStatus: 'failed',
    gateDur: '0s',
    gateResult: {
      type: 'blocked',
      icon: '🔴',
      title: 'Merge blocked: fix 3 critical findings',
      body: 'KICS reported 3 critical and 1 high issue in this Terraform change. The merge request cannot merge until critical items are fixed and the pipeline is green. Use the KMS Key Policy section in this reference for concrete fixes per check ID.',
    },
  },
  high: {
    key: 'high',
    mrTitle: 'fix: enable KMS key rotation for app-prod',
    mrMeta: 'mo → main · 1 file changed',
    branch: 'fix/enable-kms-rotation',
    validateLogs: [
      ['00:01', '$ terraform init -backend=false', 'w'],
      ['00:03', 'Terraform has been successfully initialized!', 'g'],
      ['00:04', '$ terraform fmt -check -recursive', 'w'],
      ['00:04', 'All files formatted correctly.', 'g'],
      ['00:05', '$ terraform validate', 'w'],
      ['00:05', 'Success! The configuration is valid.', 'g'],
    ],
    validateStatus: 'passed',
    validateDur: '6s',
    sastLogs: [
      ['00:06', '$ kics scan --path . --report-formats json,html --fail-on CRITICAL,HIGH', 'w'],
      ['00:07', 'Scanning Terraform files...', 'dim'],
      ['00:08', 'Running 847 queries against aws/kms, aws/iam...', 'dim'],
      ['00:11', 'Scan complete; writing reports to reports/', 'dim'],
      ['00:11', '', 'dim'],
      ['00:11', 'RESULTS SUMMARY', 'w'],
      ['00:11', '────────────────────────────────────────', 'dim'],
      ['00:11', 'CRITICAL  0   HIGH  1   MEDIUM  0   LOW  0', 'a'],
      ['00:11', '────────────────────────────────────────', 'dim'],
      ['00:12', 'KICS found results with severity HIGH', 'a'],
      ['00:12', 'Exit code: 50 (findings detected above threshold)', 'a'],
    ],
    sastStatus: 'failed',
    sastDur: '6s',
    sastFindings: [{ sev: 'H', id: 'CKV_AWS_227', desc: 'KMS key is_enabled set to false', file: 'modules/kms/main.tf', line: '9' }],
    planLogs: [],
    planStatus: 'pending',
    planDur: '',
    gateLogs: [
      ['00:12', 'Stage skipped (kics-iac-sast failed)', 'a'],
      ['00:12', 'Pipeline blocked: address high-severity findings', 'a'],
    ],
    gateStatus: 'failed',
    gateDur: '0s',
    gateResult: {
      type: 'warn-g',
      icon: '🟡',
      title: 'Pipeline failed: high finding detected',
      body: 'There are no critical findings, but CKV_AWS_227 (High) was reported. Because the job uses --fail-on CRITICAL,HIGH, the pipeline still fails and blocks merge. To treat only critical issues as hard failures, use --fail-on CRITICAL instead (many regulated teams still prefer blocking on both critical and high).',
    },
  },
  clean: {
    key: 'clean',
    mrTitle: 'fix: remediate all KICS KMS findings',
    mrMeta: 'mo → main · 4 files changed',
    branch: 'fix/remediate-kics-findings',
    validateLogs: [
      ['00:01', '$ terraform init -backend=false', 'w'],
      ['00:03', 'Terraform has been successfully initialized!', 'g'],
      ['00:04', '$ terraform fmt -check -recursive', 'w'],
      ['00:04', 'All files formatted correctly.', 'g'],
      ['00:05', '$ terraform validate', 'w'],
      ['00:05', 'Success! The configuration is valid.', 'g'],
    ],
    validateStatus: 'passed',
    validateDur: '5s',
    sastLogs: [
      ['00:06', '$ kics scan --path . --report-formats json,html --fail-on CRITICAL,HIGH', 'w'],
      ['00:07', 'Scanning Terraform files...', 'dim'],
      ['00:08', 'Running 847 queries against aws/kms, aws/iam...', 'dim'],
      ['00:10', 'Scan complete; writing reports to reports/', 'dim'],
      ['00:10', '', 'dim'],
      ['00:10', 'RESULTS SUMMARY', 'w'],
      ['00:10', '────────────────────────────────────────', 'dim'],
      ['00:10', 'CRITICAL  0   HIGH  0   MEDIUM  0   LOW  0', 'g'],
      ['00:10', '────────────────────────────────────────', 'dim'],
      ['00:11', 'No results found; all checks passed.', 'g'],
      ['00:11', 'Exit code: 0 (clean scan)', 'g'],
    ],
    sastStatus: 'passed',
    sastDur: '5s',
    sastFindings: [],
    planLogs: [
      ['00:12', '$ terraform init', 'w'],
      ['00:13', 'Initializing the backend (S3)...', 'dim'],
      ['00:13', 'Initializing provider plugins...', 'dim'],
      ['00:14', 'Terraform has been successfully initialized!', 'g'],
      ['00:14', '$ terraform plan -out=tfplan', 'w'],
      ['00:15', 'aws_kms_key.this: Refreshing state... [id=mrk-abc123]', 'dim'],
      ['00:16', 'Plan: 2 to add, 1 to change, 0 to destroy.', 'g'],
      ['00:16', 'Saved plan to tfplan', 'g'],
    ],
    planStatus: 'passed',
    planDur: '5s',
    gateLogs: [
      ['00:17', '$ python3 scripts/kics_gate.py --report reports/kics-results.json --fail-on CRITICAL', 'w'],
      ['00:17', 'Parsing KICS report: reports/kics-results.json', 'dim'],
      ['00:17', 'Critical findings: 0', 'g'],
      ['00:17', 'High findings:     0', 'g'],
      ['00:17', 'All security gates passed.', 'g'],
      ['00:18', 'Pipeline status: PASSED. MR is clear to merge.', 'g'],
    ],
    gateStatus: 'passed',
    gateDur: '2s',
    gateResult: {
      type: 'clear',
      icon: '✅',
      title: 'All gates passed; MR ready to merge',
      body: 'KICS reported no critical or high findings. Terraform plan finished successfully. This merge request can be approved. All 14 checks described in this reference pass for this configuration.',
    },
  },
};

export type StageName = 'validate' | 'sast' | 'plan' | 'gate';

export type StageStatus = 'pending' | 'running' | 'passed' | 'failed';

export function panelForReportedFinding(id: string): 'kms' | 'iamcrit' {
  if (id.startsWith('CKV2_AWS_40')) return 'iamcrit';
  if (id.startsWith('CKV_AWS_1') && !id.startsWith('CKV_AWS_10') && !id.startsWith('CKV_AWS_11')) {
    return 'iamcrit';
  }
  return 'kms';
}
