import type { PanelId } from '../types';
import { useLegacyPanel } from '../hooks/useLegacyPanel';
import kmsHtml from '../assets/panels/kms.html?raw';
import iamHtml from '../assets/panels/iam.html?raw';
import iamcritHtml from '../assets/panels/iamcrit.html?raw';
import summaryHtml from '../assets/panels/summary.html?raw';

const BY_PANEL: Record<Exclude<PanelId, 'overview' | 'pipeline'>, string> = {
  kms: kmsHtml,
  iam: iamHtml,
  iamcrit: iamcritHtml,
  summary: summaryHtml,
};

type Props = {
  panel: keyof typeof BY_PANEL;
};

/**
 * Original authored markup (trusted; from repo assets) with inline handlers
 * backed by `mountLegacyFindingHandlers` in `useLegacyPanel`.
 */
export function LegacyPanelPage({ panel }: Props) {
  const html = BY_PANEL[panel];
  const ref = useLegacyPanel(html);
  return <div className="legacy-html-root" ref={ref} />;
}
