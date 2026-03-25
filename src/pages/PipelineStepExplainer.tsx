import { useState } from 'react';
import { cn } from '../utils/cn';

const STEP_CARDS = [
  {
    title: 'Stage 01 · validate',
    heading: 'Terraform format & validate',
    body: (
      <>
        Runs <code>terraform fmt -check</code> and <code>terraform validate</code>. This is static analysis of HCL
        only, so no AWS credentials are required. Syntax and basic config errors fail here before KICS runs.
      </>
    ),
  },
  {
    title: 'Stage 02 · sast',
    heading: 'KICS IaC SAST scan',
    body: (
      <>
        Runs <code>kics scan --path . --fail-on CRITICAL,HIGH</code>. KICS reads all <code>.tf</code> files from disk.
        It does not call AWS and does not need a plan. The job exits with an error if it finds critical or high
        findings (per your flags).
      </>
    ),
  },
  {
    title: 'Stage 03 · plan',
    heading: 'Terraform plan (speculative)',
    body: (
      <>
        Runs <code>terraform plan -out=tfplan</code> in the target account using OIDC (no long-lived keys). It only
        runs after SAST succeeds. The saved plan file is attached to the merge request for reviewers.
      </>
    ),
  },
  {
    title: 'Stage 04 · security-gate',
    heading: 'MR merge gate decision',
    body: (
      <>
        Reads the KICS JSON report. If the gate job fails (for example due to critical findings), GitLab&apos;s{' '}
        <code>needs:</code> links keep the merge request from going green until the pipeline passes.
      </>
    ),
  },
] as const;

export function PipelineStepExplainer() {
  const [open, setOpen] = useState(0);

  return (
    <div className="step-explainer">
      <div className="pl-sim-label" style={{ padding: 0 }}>
        How each pipeline stage works
      </div>
      <div className="step-grid">
        {STEP_CARDS.map((card, idx) => (
          <button
            key={card.title}
            type="button"
            className={cn('step-card', open === idx && 'active')}
            onClick={() => setOpen(idx)}
          >
            <div className="step-num">{card.title}</div>
            <div className="step-title">{card.heading}</div>
            <div className="step-body">{card.body}</div>
          </button>
        ))}
      </div>
      <div>
        {open === 0 && (
          <div className="step-detail active">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '9px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--text3)',
                    marginBottom: '12px',
                  }}
                >
                  Job definition
                </div>
                <div className="yaml-editor">
                  <div className="yaml-editor-hdr">
                    <div className="yaml-dots">
                      <span className="yaml-dot r" />
                      <span className="yaml-dot a" />
                      <span className="yaml-dot g" />
                    </div>
                    <span className="yaml-fname">validate job</span>
                  </div>
                  <div className="yaml-body">
                    <div className="yl">
                      <span className="yl-n">1</span>
                      <span className="yl-k">tf-validate:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">2</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">stage: </span>
                      <span className="yl-v">validate</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">3</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">image: </span>
                      <span className="yl-s">hashicorp/terraform:1.7</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">4</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">script:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">5</span>
                      <span className="yl-plain"> - </span>
                      <span className="yl-s">terraform init -backend=false</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">6</span>
                      <span className="yl-plain"> - </span>
                      <span className="yl-s">terraform fmt -check -recursive</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">7</span>
                      <span className="yl-plain"> - </span>
                      <span className="yl-s">terraform validate</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">8</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">rules:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">9</span>
                      <span className="yl-plain"> - </span>
                      <span className="yl-k">if: </span>
                      <span className="yl-s">{'$CI_PIPELINE_SOURCE == "merge_request_event"'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ib infob" style={{ margin: 0 }}>
                <div className="ibt">Why this comes first</div>
                <ul>
                  <li>
                    KICS can still scan invalid HCL but produces noisy false results. Validating first ensures
                    findings are real.
                  </li>
                  <li>
                    <code>-backend=false</code> skips remote state setup, so this stage still needs no AWS credentials.
                  </li>
                  <li>Format check enforces consistent code style before review. Fails early, saves reviewer time.</li>
                  <li>Exit code 0 = passes and unblocks the sast stage. Non-zero = pipeline stops here.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {open === 1 && (
          <div className="step-detail active">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '9px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--text3)',
                    marginBottom: '12px',
                  }}
                >
                  KICS job definition
                </div>
                <div className="yaml-editor">
                  <div className="yaml-editor-hdr">
                    <div className="yaml-dots">
                      <span className="yaml-dot r" />
                      <span className="yaml-dot a" />
                      <span className="yaml-dot g" />
                    </div>
                    <span className="yaml-fname">kics-iac-sast job</span>
                  </div>
                  <div className="yaml-body">
                    <div className="yl">
                      <span className="yl-n">1</span>
                      <span className="yl-k">kics-iac-sast:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">2</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">stage: </span>
                      <span className="yl-v">sast</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">3</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">needs: </span>
                      <span className="yl-s">[tf-validate]</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">4</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">image: </span>
                      <span className="yl-s">checkmarx/kics:latest</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">5</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">script:</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">6</span>
                      <span className="yl-plain"> - </span>
                      <span className="yl-s">kics scan \</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">7</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-s">--path . \</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">8</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-s">--report-formats json,html \</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">9</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-s">--output-path reports/ \</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">10</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-s">--fail-on CRITICAL,HIGH</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">11</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">artifacts:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">12</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">reports:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">13</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">sast: </span>
                      <span className="yl-s">reports/kics-results.json</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">14</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">when: </span>
                      <span className="yl-v">always</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ib warn" style={{ margin: 0 }}>
                <div className="ibt">Key flags explained</div>
                <ul>
                  <li>
                    <code>--path .</code>: scan every <code>.tf</code> file under the repo (recursive).
                  </li>
                  <li>
                    <code>--report-formats json,html</code>: JSON for automation (gate job); HTML for people reading
                    the report in GitLab.
                  </li>
                  <li>
                    <code>--fail-on CRITICAL,HIGH</code>: non-zero exit only for those levels; medium and low stay
                    informational unless you change the flags.
                  </li>
                  <li>
                    <code>--output-path reports/</code>: where KICS writes files; GitLab passes this folder to later
                    jobs as an artifact.
                  </li>
                  <li>
                    <code>when: always</code> on artifacts: upload the report even when KICS fails, so reviewers still
                    see the findings.
                  </li>
                  <li>No AWS credentials: the scan is static file analysis only.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {open === 2 && (
          <div className="step-detail active">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '9px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--text3)',
                    marginBottom: '12px',
                  }}
                >
                  Plan job definition
                </div>
                <div className="yaml-editor">
                  <div className="yaml-editor-hdr">
                    <div className="yaml-dots">
                      <span className="yaml-dot r" />
                      <span className="yaml-dot a" />
                      <span className="yaml-dot g" />
                    </div>
                    <span className="yaml-fname">tf-plan job</span>
                  </div>
                  <div className="yaml-body">
                    <div className="yl">
                      <span className="yl-n">1</span>
                      <span className="yl-k">tf-plan:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">2</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">stage: </span>
                      <span className="yl-v">plan</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">3</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">needs: </span>
                      <span className="yl-s">[kics-iac-sast]</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">4</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">image: </span>
                      <span className="yl-s">hashicorp/terraform:1.7</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">5</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">id_tokens:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">6</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">AWS_TOKEN:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">7</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">aud: </span>
                      <span className="yl-s">sts.amazonaws.com</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">8</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">script:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">9</span>
                      <span className="yl-plain"> - </span>
                      <span className="yl-s">terraform init</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">10</span>
                      <span className="yl-plain"> - </span>
                      <span className="yl-s">terraform plan -out=tfplan</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">11</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">artifacts:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">12</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">paths: </span>
                      <span className="yl-s">[tfplan]</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ib greenb" style={{ margin: 0 }}>
                <div className="ibt">OIDC federation (no static AWS keys)</div>
                <ul>
                  <li>
                    The <code>id_tokens</code> block asks GitLab for a short-lived OIDC JWT. AWS trusts that token so
                    the job can call the API without storing access keys in variables.
                  </li>
                  <li>
                    The IAM role trust policy must allow this GitLab project (and usually the right branch or
                    environment) to assume the role.
                  </li>
                  <li>
                    <code>needs: [kics-iac-sast]</code> means plan does not run if the KICS job failed on critical or
                    high findings.
                  </li>
                  <li>
                    <code>terraform plan</code> here is a dry run: it does not create or change real infrastructure by
                    itself.
                  </li>
                  <li>The saved plan is available to the security-gate job and to reviewers in the merge request.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {open === 3 && (
          <div className="step-detail active">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '9px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--text3)',
                    marginBottom: '12px',
                  }}
                >
                  Gate job definition
                </div>
                <div className="yaml-editor">
                  <div className="yaml-editor-hdr">
                    <div className="yaml-dots">
                      <span className="yaml-dot r" />
                      <span className="yaml-dot a" />
                      <span className="yaml-dot g" />
                    </div>
                    <span className="yaml-fname">security-gate job</span>
                  </div>
                  <div className="yaml-body">
                    <div className="yl">
                      <span className="yl-n">1</span>
                      <span className="yl-k">security-gate:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">2</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">stage: </span>
                      <span className="yl-v">security-gate</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">3</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">needs:</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">4</span>
                      <span className="yl-plain"> - </span>
                      <span className="yl-s">kics-iac-sast</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">5</span>
                      <span className="yl-plain"> - </span>
                      <span className="yl-s">tf-plan</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">6</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">image: </span>
                      <span className="yl-s">python:3.12-slim</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">7</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">script:</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">8</span>
                      <span className="yl-plain"> - </span>
                      <span className="yl-s">python3 scripts/kics_gate.py \</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">9</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-s">--report reports/kics-results.json \</span>
                    </div>
                    <div className="yl yl-hl">
                      <span className="yl-n">10</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-s">--fail-on CRITICAL</span>
                    </div>
                    <div className="yl">
                      <span className="yl-n">11</span>
                      <span className="yl-plain"> </span>
                      <span className="yl-k">allow_failure: </span>
                      <span className="yl-v">false</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ib warn" style={{ margin: 0 }}>
                <div className="ibt">How the gate blocks the MR</div>
                <ul>
                  <li>
                    The gate script parses <code>kics-results.json</code> and counts findings by severity
                  </li>
                  <li>
                    If the critical count is above zero, the script calls <code>sys.exit(1)</code> so GitLab records the
                    job as failed.
                  </li>
                  <li>
                    A failed pipeline usually blocks merge until you fix the issues and the pipeline goes green again.
                  </li>
                  <li>
                    <code>allow_failure: false</code> (the default) means this job&apos;s failure fails the whole
                    pipeline for the MR.
                  </li>
                  <li>
                    High findings may show up as warnings or comments on the MR without failing the job, depending on
                    how your gate script and <code>--fail-on</code> flags are set.
                  </li>
                  <li>
                    The gate job also posts a summary comment to the MR via the GitLab API using{' '}
                    <code>$CI_MERGE_REQUEST_IID</code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
