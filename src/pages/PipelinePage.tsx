import { useCallback, useMemo, useState } from 'react';
import {
  panelForReportedFinding,
  PIPELINE_SCENARIOS,
  type GateResult,
  type PipelineScenario,
  type ReportedFinding,
  type StageName,
  type StageStatus,
  type TermLine,
  type TermTone,
} from '../pipeline/scenarios';
import type { PanelId } from '../types';
import { cn } from '../utils/cn';
import { PipelineStepExplainer } from './PipelineStepExplainer';

type Props = {
  onOpenFinding: (panel: PanelId) => void;
};

type DetailView = 'welcome' | StageName;

const STAGES: StageName[] = ['validate', 'sast', 'plan', 'gate'];

const STAGE_META: Record<
  StageName,
  { icon: string; label: string; bubble: string }
> = {
  validate: { icon: '✓', label: 'tf-validate', bubble: '✓' },
  sast: { icon: '🔍', label: 'kics-iac-sast', bubble: '🔍' },
  plan: { icon: '📋', label: 'tf-plan', bubble: '📋' },
  gate: { icon: '🔒', label: 'security-gate', bubble: '🔒' },
};

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function termToneClass(tone: TermTone): string {
  const map: Record<TermTone, string> = {
    w: 'w',
    dim: 'dim',
    g: 'g',
    r: 'r',
    a: 'a',
    b: 'b',
  };
  return `term-s ${map[tone]}`;
}

type StageModel = {
  ui: StageStatus;
  dur: string;
  lines: TermLine[];
};

function emptyStages(): Record<StageName, StageModel> {
  return {
    validate: { ui: 'pending', dur: '', lines: [] },
    sast: { ui: 'pending', dur: '', lines: [] },
    plan: { ui: 'pending', dur: '', lines: [] },
    gate: { ui: 'pending', dur: '', lines: [] },
  };
}

export function PipelinePage({ onOpenFinding }: Props) {
  const [scenarioKey, setScenarioKey] = useState<PipelineScenario['key']>('critical');
  const scenario = PIPELINE_SCENARIOS[scenarioKey];

  const [running, setRunning] = useState(false);
  const [runLabel, setRunLabel] = useState<'run' | 'running' | 'again'>('run');
  const [detailView, setDetailView] = useState<DetailView>('welcome');
  const [focusedStage, setFocusedStage] = useState<DetailView>('welcome');
  const [stages, setStages] = useState<Record<StageName, StageModel>>(emptyStages);
  const [reportRows, setReportRows] = useState<readonly ReportedFinding[]>([]);
  const [gateCard, setGateCard] = useState<GateResult | null>(null);

  const resetRun = useCallback(() => {
    setStages(emptyStages());
    setDetailView('welcome');
    setFocusedStage('welcome');
    setReportRows([]);
    setGateCard(null);
    setRunLabel('run');
  }, []);

  const applyScenario = useCallback(
    (key: PipelineScenario['key']) => {
      if (running) return;
      setScenarioKey(key);
      resetRun();
    },
    [running, resetRun],
  );

  const header = useMemo(() => {
    if (focusedStage === 'welcome') {
      return {
        icon: '💤' as const,
        title: 'Select a stage above or run the pipeline',
        badge: 'pending' as const,
        badgeClass: 'pending' as const,
        dur: '',
      };
    }
    const s = stages[focusedStage];
    const meta = STAGE_META[focusedStage];
    const badge =
      s.ui === 'passed' ? 'passed' : s.ui === 'failed' ? 'failed' : s.ui === 'running' ? 'running' : 'pending';
    return {
      icon: meta.icon,
      title: meta.label,
      badge,
      badgeClass: badge,
      dur: s.dur,
    };
  }, [focusedStage, stages]);

  const sastDone = stages.sast.ui === 'passed' || stages.sast.ui === 'failed';
  const showFindingsTable = detailView === 'sast' && sastDone;

  const runStage = async (
    name: StageName,
    logs: readonly TermLine[],
    final: 'passed' | 'failed' | 'pending',
    dur: string,
    lineDelayMs: number,
  ) => {
    setStages((prev) => ({
      ...prev,
      [name]: { ...prev[name], ui: 'running', lines: [] },
    }));
    setDetailView(name);
    setFocusedStage(name);
    await delay(300);

    if (logs.length === 0) {
      setStages((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          lines: [['--:--', 'Stage skipped due to earlier failure', 'dim']],
          ui: final === 'pending' ? 'pending' : final,
          dur,
        },
      }));
    } else {
      for (const line of logs) {
        setStages((prev) => ({
          ...prev,
          [name]: { ...prev[name], lines: [...prev[name].lines, line] },
        }));
        await delay(lineDelayMs);
      }
      await delay(400);
      setStages((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          ui: final === 'pending' ? 'pending' : final,
          dur,
        },
      }));
    }
    setFocusedStage(name);
  };

  const runPipeline = async () => {
    if (running) return;
    setRunning(true);
    setRunLabel('running');
    setGateCard(null);
    setReportRows([]);
    setStages(emptyStages());

    const s = scenario;
    const paced = scenarioKey === 'clean' ? 120 : 140;

    await runStage('validate', s.validateLogs, s.validateStatus, s.validateDur, paced);
    if (s.validateStatus === 'failed') {
      setRunning(false);
      setRunLabel('again');
      return;
    }

    await runStage('sast', s.sastLogs, s.sastStatus, s.sastDur, paced);
    setReportRows(s.sastFindings);

    if (s.sastStatus === 'failed') {
      await runStage('gate', s.gateLogs, s.gateStatus, s.gateDur, paced);
      setRunning(false);
      setRunLabel('again');
      return;
    }

    await runStage('plan', s.planLogs, s.planStatus, s.planDur, paced);
    await runStage('gate', s.gateLogs, s.gateStatus, s.gateDur, paced);
    if (s.gateResult) setGateCard(s.gateResult);
    setRunning(false);
    setRunLabel('again');
  };

  const focusStage = (name: DetailView) => {
    setFocusedStage(name);
    setDetailView(name === 'welcome' ? 'welcome' : name);
  };

  const scBtn = (key: PipelineScenario['key'], emojiVariant: 'fail' | 'pass' | 'neutral') =>
    cn(
      'sc-btn',
      scenarioKey === key && 'active',
      scenarioKey === key && emojiVariant === 'fail' && 'fail-sc',
      scenarioKey === key && emojiVariant === 'pass' && 'pass-sc',
    );

  return (
    <div className="panel active pl-page">
      <div className="pl-hero">
        <div className="pl-hero-tag">Interactive walkthrough</div>
        <h2>KICS in a GitLab CI Pipeline</h2>
        <p>
          Walk through a Terraform merge request in GitLab: the{' '}
          <code
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              background: 'var(--code-inline-bg-strong)',
              padding: '1px 5px',
              borderRadius: '3px',
            }}
          >
            .gitlab-ci.yml
          </code>{' '}
          jobs, the KICS scan, and how the security gate affects merge. Pick a scenario below and run the demo.
        </p>
      </div>

      <div className="pl-simulator">
        <div className="pl-sim-label">Choose a scenario to simulate</div>
        <div className="scenario-bar">
          <button type="button" className={scBtn('critical', 'fail')} onClick={() => applyScenario('critical')}>
            🔴 Critical finding (MR blocked)
          </button>
          <button type="button" className={scBtn('high', 'neutral')} onClick={() => applyScenario('high')}>
            🟡 High finding (warning only)
          </button>
          <button type="button" className={scBtn('clean', 'pass')} onClick={() => applyScenario('clean')}>
            🟢 Clean scan (MR approved)
          </button>
        </div>

        <div className="mr-bar">
          <div className="mr-bar-avatar">MO</div>
          <div className="mr-bar-text">
            <div className="mr-bar-title">{scenario.mrTitle}</div>
            <div className="mr-bar-meta">
              {scenario.mrMeta} · <span className="mr-bar-branch">{scenario.branch}</span>
            </div>
          </div>
          <button type="button" className="run-btn" disabled={running} onClick={() => void runPipeline()}>
            {runLabel === 'run' && '▶ Run pipeline'}
            {runLabel === 'running' && '⏳ Running…'}
            {runLabel === 'again' && '↺ Run again'}
          </button>
        </div>

        <div className="pipeline-track">
          {STAGES.map((id) => (
            <button
              key={id}
              type="button"
              className={cn(
                'pl-stage',
                stages[id].ui,
                focusedStage === id && 'active-view',
              )}
              onClick={() => {
                if (stages[id].lines.length > 0 || stages[id].ui !== 'pending') focusStage(id);
              }}
            >
              <div className="pl-stage-bubble">{STAGE_META[id].bubble}</div>
              <div className="pl-stage-name">{id === 'gate' ? 'security-gate' : id}</div>
              <div className="pl-stage-dur">{stages[id].dur}</div>
            </button>
          ))}
        </div>

        <div className="stage-detail">
          <div className="sd-hdr">
            <span className="sd-icon">{header.icon}</span>
            <span className="sd-title">{header.title}</span>
            <span className={cn('sd-badge', header.badgeClass)}>{header.badge}</span>
            <span className="sd-dur">{header.dur}</span>
          </div>
          <div className="sd-body">
            <div className={cn('sd-view', detailView === 'welcome' && 'active')}>
              <p
                style={{
                  color: 'var(--text2)',
                  fontSize: '13px',
                  lineHeight: 1.75,
                  marginBottom: '20px',
                }}
              >
                Choose a scenario above and click <strong style={{ color: 'var(--text)' }}>Run pipeline</strong> to
                see how KICS processes a Terraform merge request in GitLab CI. Click any completed stage bubble to
                inspect its output.
              </p>
              <div className="yaml-editor">
                <div className="yaml-editor-hdr">
                  <div className="yaml-dots">
                    <span className="yaml-dot r" />
                    <span className="yaml-dot a" />
                    <span className="yaml-dot g" />
                  </div>
                  <span className="yaml-fname">.gitlab-ci.yml (KICS job)</span>
                </div>
                <div className="yaml-body">
                  <div className="yl">
                    <span className="yl-n">1</span>
                    <span className="yl-k">include:</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">2</span>
                    <span className="yl-plain"> - </span>
                    <span className="yl-k">template: </span>
                    <span className="yl-s">Security/SAST-IaC.gitlab-ci.yml</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">3</span>
                    <span className="yl-plain" />
                  </div>
                  <div className="yl">
                    <span className="yl-n">4</span>
                    <span className="yl-k">stages:</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">5</span>
                    <span className="yl-plain"> - </span>
                    <span className="yl-v">validate</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">6</span>
                    <span className="yl-plain"> - </span>
                    <span className="yl-v">sast</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">7</span>
                    <span className="yl-plain"> - </span>
                    <span className="yl-v">plan</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">8</span>
                    <span className="yl-plain"> - </span>
                    <span className="yl-v">security-gate</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">9</span>
                    <span className="yl-plain" />
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">10</span>
                    <span className="yl-k">kics-iac-sast:</span>
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">11</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">stage: </span>
                    <span className="yl-v">sast</span>
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">12</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">image: </span>
                    <span className="yl-s">checkmarx/kics:latest</span>
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">13</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">variables:</span>
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">14</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">KICS_QUERIES_PATH: </span>
                    <span className="yl-s">&quot;assets/queries/terraform/aws&quot;</span>
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">15</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">script:</span>
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">16</span>
                    <span className="yl-plain"> - </span>
                    <span className="yl-s">kics scan</span>
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">17</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-s">--path .</span>
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">18</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-s">--report-formats json,html</span>
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">19</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-s">--output-path reports/</span>
                  </div>
                  <div className="yl yl-hl">
                    <span className="yl-n">20</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-s">--fail-on CRITICAL,HIGH</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">21</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">artifacts:</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">22</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">reports:</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">23</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">sast: </span>
                    <span className="yl-s">reports/kics-results.json</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">24</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">paths:</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">25</span>
                    <span className="yl-plain"> - </span>
                    <span className="yl-s">reports/</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">26</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">when: </span>
                    <span className="yl-v">always</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">27</span>
                    <span className="yl-plain"> </span>
                    <span className="yl-k">rules:</span>
                  </div>
                  <div className="yl">
                    <span className="yl-n">28</span>
                    <span className="yl-plain"> - </span>
                    <span className="yl-k">if: </span>
                    <span className="yl-s">{'$CI_PIPELINE_SOURCE == "merge_request_event"'}</span>
                  </div>
                </div>
              </div>
            </div>

            {STAGES.map((id) => (
              <div key={id} className={cn('sd-view', detailView === id && 'active')}>
                <div className="term" style={id === 'sast' || id === 'gate' ? { marginBottom: '16px' } : undefined}>
                  {stages[id].lines.map((line, i) => (
                    <div key={`${id}-${i}`} className="term-line vis">
                      <span className="term-t">{line[0]}</span>
                      <span className={termToneClass(line[2])}>{line[1]}</span>
                    </div>
                  ))}
                </div>
                {id === 'sast' && showFindingsTable && (
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '9px',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color: 'var(--text3)',
                        marginBottom: '10px',
                      }}
                    >
                      KICS findings report
                    </div>
                    <table className="findings-tbl">
                      <thead>
                        <tr>
                          <th>Severity</th>
                          <th>Check ID</th>
                          <th>Description</th>
                          <th>File</th>
                          <th>Line</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRows.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', color: 'var(--green)', padding: '16px' }}>
                              ✓ No findings (clean scan)
                            </td>
                          </tr>
                        ) : (
                          reportRows.map((f) => (
                            <tr
                              key={f.id + f.line}
                              title="Click to view this check in the reference"
                              onClick={() => onOpenFinding(panelForReportedFinding(f.id))}
                            >
                              <td>
                                <span className={cn('ftbl-sev', f.sev)}>
                                  {f.sev === 'C' ? 'Critical' : f.sev === 'H' ? 'High' : 'Medium'}
                                </span>
                              </td>
                              <td className="ftbl-id">{f.id}</td>
                              <td>{f.desc}</td>
                              <td className="ftbl-file">{f.file}</td>
                              <td className="ftbl-file">{f.line}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                {id === 'gate' && gateCard && detailView === 'gate' && (
                  <div className={cn('mr-gate', gateCard.type)}>
                    <div className="mr-gate-icon">{gateCard.icon}</div>
                    <div>
                      <div className="mr-gate-title">{gateCard.title}</div>
                      <div className="mr-gate-body">{gateCard.body}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <PipelineStepExplainer />
    </div>
  );
}
