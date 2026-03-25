import { useEffect, useRef, type RefObject } from 'react';
import { mountLegacyFindingHandlers } from '../lib/legacyFindingsDom';

/**
 * Renders trusted static HTML (from repo assets) and attaches legacy global handlers
 * expected by `onclick` attributes in that markup.
 */
export function useLegacyPanel(html: string): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.innerHTML = html;
    const removeHandlers = mountLegacyFindingHandlers();
    return () => {
      removeHandlers();
      node.innerHTML = '';
    };
  }, [html]);

  return ref;
}
