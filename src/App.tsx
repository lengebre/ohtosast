import { useState, type ReactNode } from 'react';
import { TopNav } from './components/TopNav';
import type { PanelId } from './types';
import { LegacyPanelPage } from './pages/LegacyPanelPage';
import { OverviewPage } from './pages/OverviewPage';
import { PipelinePage } from './pages/PipelinePage';

export default function App() {
  const [panel, setPanel] = useState<PanelId>('overview');

  let body: ReactNode;
  switch (panel) {
    case 'overview':
      body = <OverviewPage onNavigate={setPanel} />;
      break;
    case 'pipeline':
      body = <PipelinePage onOpenFinding={setPanel} />;
      break;
    case 'kms':
    case 'iam':
    case 'iamcrit':
    case 'summary':
      body = <LegacyPanelPage panel={panel} />;
      break;
  }

  return (
    <>
      <TopNav active={panel} onNavigate={setPanel} />
      {body}
    </>
  );
}
